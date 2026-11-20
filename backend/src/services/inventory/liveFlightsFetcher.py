import sys
import json
import argparse
from datetime import datetime

def _parse_time(value):
    padded = [*(value or []), None, None]
    return (padded[0] or 0, padded[1] or 0)

def fetch_flights(from_airport, to_airport, departure_date, cabin_class='economy'):
    try:
        from fast_flights import FlightQuery, Passengers, create_query, fetch_flights_html
        from selectolax.lexbor import LexborHTMLParser
    except ImportError:
        print(json.dumps({"success": False, "error": "fast_flights not installed", "data": []}))
        return

    try:
        if not departure_date:
            departure_date = datetime.now().strftime("%Y-%m-%d")

        query = create_query(
            flights=[
                FlightQuery(
                    date=departure_date,
                    from_airport=from_airport.upper(),
                    to_airport=to_airport.upper(),
                ),
            ],
            trip="one-way",
            seat=cabin_class.lower() if cabin_class in ['economy', 'premium-economy', 'business', 'first'] else 'economy',
            passengers=Passengers(adults=1),
            currency="INR",
        )

        html = fetch_flights_html(query)
        parser = LexborHTMLParser(html)
        script = parser.css_first(r"script.ds\:1")
        if not script:
            print(json.dumps({"success": False, "error": "no script found", "data": []}))
            return

        js = script.text()
        data = js.split("data:", 1)[1].rsplit(",", 1)[0]
        payload = json.loads(data)

        if not payload or len(payload) < 4 or not payload[3] or not payload[3][0]:
            print(json.dumps({"success": True, "count": 0, "data": []}))
            return

        flights_out = []

        for idx, k in enumerate(payload[3][0]):
            flight_data = k[0]
            price_info = k[1][0] if len(k) > 1 and k[1] and k[1][0] else None
            total_amount = int(price_info[1]) if price_info and len(price_info) > 1 else 5000

            segment_list = flight_data[2] if len(flight_data) > 2 else []
            if not segment_list:
                continue

            legs = []
            primary_airline = "Scheduled Airline"
            primary_code = "6E"
            primary_flight_number = ""

            for s_idx, sf in enumerate(segment_list):
                # sf[3] = from_code, sf[4] = from_name
                # sf[6] = to_code, sf[5] = to_name
                from_code = sf[3] if len(sf) > 3 else from_airport.upper()
                from_name = sf[4] if len(sf) > 4 else f"{from_code} Airport"
                to_code = sf[6] if len(sf) > 6 else to_airport.upper()
                to_name = sf[5] if len(sf) > 5 else f"{to_code} Airport"

                dep_time = _parse_time(sf[8]) if len(sf) > 8 else (0, 0)
                arr_time = _parse_time(sf[10]) if len(sf) > 10 else (0, 0)

                dep_date = tuple(sf[20]) if len(sf) > 20 and sf[20] else (2026, 11, 25)
                arr_date = tuple(sf[21]) if len(sf) > 21 and sf[21] else (2026, 11, 25)

                dep_iso = f"{dep_date[0]:04d}-{dep_date[1]:02d}-{dep_date[2]:02d}T{dep_time[0]:02d}:{dep_time[1]:02d}:00.000Z"
                arr_iso = f"{arr_date[0]:04d}-{arr_date[1]:02d}-{arr_date[2]:02d}T{arr_time[0]:02d}:{arr_time[1]:02d}:00.000Z"

                plane_type = sf[17] if len(sf) > 17 and sf[17] else "Airbus A320neo"

                # sf[22] = ['6E', '5351', None, 'IndiGo']
                carrier = "6E"
                flight_no = ""
                airline_label = "Scheduled Airline"

                if len(sf) > 22 and sf[22] and isinstance(sf[22], list):
                    carrier = sf[22][0] or "6E"
                    flight_no = str(sf[22][1]) if len(sf[22]) > 1 and sf[22][1] else ""
                    airline_label = sf[22][3] if len(sf[22]) > 3 and sf[22][3] else carrier

                full_flight_code = f"{carrier}-{flight_no}" if flight_no else f"{carrier}-{dep_time[0]:02d}{dep_time[1]:02d}"

                if s_idx == 0:
                    primary_airline = airline_label
                    primary_code = carrier
                    primary_flight_number = full_flight_code

                legs.append({
                    "airline": airline_label,
                    "airlineCode": carrier,
                    "flightNumber": full_flight_code,
                    "aircraft": plane_type,
                    "departureTime": dep_iso,
                    "arrivalTime": arr_iso,
                    "origin": {
                        "code": from_code,
                        "airport": from_name,
                        "city": from_name.replace(" International Airport", "").replace(" Airport", "").strip(),
                    },
                    "destination": {
                        "code": to_code,
                        "airport": to_name,
                        "city": to_name.replace(" International Airport", "").replace(" Airport", "").strip(),
                    }
                })

            stops = len(legs) - 1
            base_fare = int(total_amount * 0.85)
            taxes = total_amount - base_fare

            first_leg = legs[0]
            last_leg = legs[-1]

            # Calculate duration in minutes between first dep and last arr
            try:
                t1 = datetime.fromisoformat(first_leg["departureTime"].replace("Z", "+00:00"))
                t2 = datetime.fromisoformat(last_leg["arrivalTime"].replace("Z", "+00:00"))
                total_duration = int((t2 - t1).total_seconds() / 60)
                if total_duration <= 0:
                    total_duration = 120
            except Exception:
                total_duration = 120

            flights_out.append({
                "_id": f"live_gf_{from_airport.lower()}_{to_airport.lower()}_{idx}_{total_amount}",
                "offerReference": f"LIVE-{primary_flight_number.replace('-', '')}-{idx}",
                "provider": "Google Flights Live",
                "isLive": True,
                "originCode": from_airport.upper(),
                "originCity": first_leg["origin"]["city"],
                "destinationCode": to_airport.upper(),
                "destinationCity": last_leg["destination"]["city"],
                "departureDate": departure_date,
                "tripType": "one-way",
                "cabinClass": cabin_class,
                "totalDurationMinutes": total_duration,
                "stops": stops,
                "availableSeats": 9,
                "pricing": {
                    "currency": "INR",
                    "baseFare": base_fare,
                    "taxes": taxes,
                    "totalAmount": total_amount,
                },
                "baggage": {
                    "cabin": "7 kg",
                    "checkIn": "15 kg" if stops == 0 else "15 kg per sector",
                },
                "fareRules": {
                    "isRefundable": False,
                },
                "legs": legs,
            })

        print(json.dumps({"success": True, "count": len(flights_out), "data": flights_out}))

    except Exception as e:
        print(json.dumps({"success": False, "error": str(e), "data": []}))

if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--from_airport", required=True)
    parser.add_argument("--to_airport", required=True)
    parser.add_argument("--date", required=True)
    parser.add_argument("--cabin", default="economy")
    args = parser.parse_args()

    fetch_flights(args.from_airport, args.to_airport, args.date, args.cabin)
