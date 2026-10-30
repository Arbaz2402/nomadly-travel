import { Train } from '../models/Train.js';

export const searchTrains = async (req, res) => {
  try {
    const {
      origin,
      destination,
      travelClass,
      trainType,
      sortBy = 'departure_asc',
    } = req.query;

    const query = { isActive: true };

    if (origin && origin.trim() !== '') {
      query.$or = [
        { originCity: new RegExp(origin, 'i') },
        { originStationCode: new RegExp(`^${origin}$`, 'i') },
        { originStationName: new RegExp(origin, 'i') },
      ];
    }

    if (destination && destination.trim() !== '') {
      const destMatch = [
        { destinationCity: new RegExp(destination, 'i') },
        { destinationStationCode: new RegExp(`^${destination}$`, 'i') },
        { destinationStationName: new RegExp(destination, 'i') },
      ];
      if (query.$or) {
        query.$and = [{ $or: query.$or }, { $or: destMatch }];
        delete query.$or;
      } else {
        query.$or = destMatch;
      }
    }

    if (trainType && trainType !== 'all') {
      query.trainType = trainType;
    }

    if (travelClass && travelClass !== 'all') {
      query['classes.classCode'] = travelClass;
    }

    let sortOptions = {};
    if (sortBy === 'duration_asc') sortOptions = { durationMinutes: 1 };
    else if (sortBy === 'departure_asc') sortOptions = { departureTime: 1 };
    else if (sortBy === 'arrival_asc') sortOptions = { arrivalTime: 1 };

    const trains = await Train.find(query).sort(sortOptions).limit(30);

    return res.status(200).json({
      success: true,
      count: trains.length,
      data: trains,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const getTrainById = async (req, res) => {
  try {
    const train = await Train.findById(req.params.id);
    if (!train) {
      return res.status(404).json({ success: false, message: 'Train schedule not found' });
    }
    return res.status(200).json({ success: true, data: train });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
