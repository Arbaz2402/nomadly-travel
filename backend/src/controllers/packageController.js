import {
  fetchVacationPackages,
  fetchPackageByIdOrCity,
} from '../services/inventory/packageService.js';

/**
 * Fetch dynamic flight + hotel vacation packages
 */
export const getVacationPackages = async (req, res) => {
  try {
    const { destination, nights } = req.query;
    const packages = await fetchVacationPackages({ destination, nights });

    return res.status(200).json({
      success: true,
      count: packages.length,
      data: packages,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Get package details by ID or City
 */
export const getPackageById = async (req, res) => {
  try {
    const { id } = req.params;
    const pkg = await fetchPackageByIdOrCity(id);

    if (!pkg) {
      return res.status(404).json({ success: false, message: 'Vacation package not found.' });
    }

    return res.status(200).json({ success: true, data: pkg });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
