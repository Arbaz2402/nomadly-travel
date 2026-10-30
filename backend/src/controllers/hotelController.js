import { Hotel } from '../models/Hotel.js';

export const searchHotels = async (req, res) => {
  try {
    const {
      city,
      minPrice,
      maxPrice,
      starRating,
      propertyType,
      amenities,
      freeCancellation,
      breakfastIncluded,
      sortBy = 'recommended',
    } = req.query;

    const query = { isActive: true };

    if (city && city.trim() !== '') {
      query.$or = [
        { 'location.city': new RegExp(city, 'i') },
        { 'location.address': new RegExp(city, 'i') },
        { name: new RegExp(city, 'i') },
      ];
    }

    if (starRating && starRating !== 'all') {
      query.starRating = { $gte: Number(starRating) };
    }

    if (propertyType && propertyType !== 'all') {
      query.propertyType = propertyType;
    }

    if (amenities) {
      const amenitiesList = Array.isArray(amenities) ? amenities : amenities.split(',');
      query.amenities = { $all: amenitiesList };
    }

    if (freeCancellation === 'true') {
      query['rooms.freeCancellationBeforeDays'] = { $gt: 0 };
    }

    if (breakfastIncluded === 'true') {
      query['rooms.mealPlan'] = { $in: ['breakfast_included', 'all_inclusive'] };
    }

    let sortOptions = {};
    if (sortBy === 'price_asc') sortOptions = { 'rooms.0.pricePerNight': 1 };
    else if (sortBy === 'price_desc') sortOptions = { 'rooms.0.pricePerNight': -1 };
    else if (sortBy === 'rating_desc') sortOptions = { guestRating: -1 };
    else sortOptions = { isFeatured: -1, guestRating: -1 };

    let hotels = await Hotel.find(query).sort(sortOptions).limit(40);

    // Filter by price range against lowest room rate if specified
    if (minPrice || maxPrice) {
      hotels = hotels.filter((hotel) => {
        const lowestRoomRate = Math.min(...hotel.rooms.map((r) => r.pricePerNight));
        const matchesMin = minPrice ? lowestRoomRate >= Number(minPrice) : true;
        const matchesMax = maxPrice ? lowestRoomRate <= Number(maxPrice) : true;
        return matchesMin && matchesMax;
      });
    }

    return res.status(200).json({
      success: true,
      count: hotels.length,
      data: hotels,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const getHotelById = async (req, res) => {
  try {
    const hotel = await Hotel.findById(req.params.id);
    if (!hotel) {
      return res.status(404).json({ success: false, message: 'Hotel not found' });
    }
    return res.status(200).json({ success: true, data: hotel });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const getFeaturedHotels = async (req, res) => {
  try {
    const hotels = await Hotel.find({ isFeatured: true, isActive: true }).limit(6);
    return res.status(200).json({ success: true, data: hotels });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
