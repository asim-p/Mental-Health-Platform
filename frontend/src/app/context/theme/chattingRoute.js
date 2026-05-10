const Property = require("../models/Property");
const { AppError, asyncHandler } = require("../middlewares/errorHandler");
const logger = require("../utils/logger");

// @desc    Create new property
// @route   POST /api/properties
// @access  Private (Owners only)
exports.createProperty = asyncHandler(async (req, res, next) => {
  const {
    title,
    description,
    price,
    location,
    property_type,
    bedrooms,
    bathrooms,
    amenities,
    square_feet,
  } = req.body;
  const photoFiles = req.files;

  if (!photoFiles || photoFiles.length === 0) {
    return next(new AppError("At least one photo is required", 400));
  }

  const photoPaths = photoFiles.map((file) => `/uploads/${file.filename}`);

  const newProperty = new Property({
    owner_id: req.user.id,
    title,
    description,
    price,
    location,
    property_type,
    bedrooms,
    bathrooms,
    amenities,
    square_feet,
    photos: photoPaths,
  });

  await newProperty.save();

  // Populate owner info
  await newProperty.populate("owner_id", "name _id");

  logger.info(
    `New property created: ${newProperty.title} by user ${req.user.id}`,
  );

  res.status(201).json({
    success: true,
    message: "Property added successfully",
    property: newProperty,
  });
});

// @desc    Get all properties with filtering and pagination
// @route   GET /api/properties
// @access  Public
exports.getAllProperties = asyncHandler(async (req, res, next) => {
  const {
    location,
    minPrice,
    maxPrice,
    property_type,
    page = 1,
    limit = 10,
    sort = "created_date",
    order = "desc",
  } = req.query;

  let filters = { status: "available" };

  // Apply filters
  if (location) {
    filters.location = { $regex: location, $options: "i" };
  }

  if (minPrice && maxPrice) {
    filters.price = { $gte: Number(minPrice), $lte: Number(maxPrice) };
  } else if (minPrice) {
    filters.price = { $gte: Number(minPrice) };
  } else if (maxPrice) {
    filters.price = { $lte: Number(maxPrice) };
  }

  if (property_type) {
    filters.property_type = property_type;
  }

  // Pagination
  const skip = (parseInt(page) - 1) * parseInt(limit);

  // Sorting
  const sortOrder = order === "desc" ? -1 : 1;
  const sortOptions = {};
  sortOptions[sort] = sortOrder;

  const properties = await Property.find(filters)
    .populate("owner_id", "name _id")
    .sort(sortOptions)
    .skip(skip)
    .limit(parseInt(limit));

  // Get total count for pagination
  const total = await Property.countDocuments(filters);

  res.json({
    success: true,
    count: properties.length,
    total,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      pages: Math.ceil(total / parseInt(limit)),
    },
    data: properties,
  });
});

// @desc    Get featured properties
// @route   GET /api/properties/featured
// @access  Public
exports.getFeaturedProperties = asyncHandler(async (req, res, next) => {
  const { limit = 6 } = req.query;

  const properties = await Property.getFeatured(parseInt(limit));

  res.json({
    success: true,
    count: properties.length,
    data: properties,
  });
});

// @desc    Get single property
// @route   GET /api/properties/:id
// @access  Public
exports.getPropertyById = asyncHandler(async (req, res, next) => {
  const property = await Property.findById(req.params.id).populate(
    "owner_id",
    "name _id email phone",
  );

  if (!property) {
    return next(new AppError("Property not found", 404));
  }

  // Increment view count
  await property.incrementViews();

  res.json({
    success: true,
    data: property,
  });
});

// @desc    Update property
// @route   PUT /api/properties/:id
// @access  Private (Owner only)
exports.updateProperty = asyncHandler(async (req, res, next) => {
  const property = await Property.findById(req.params.id);

  if (!property) {
    return next(new AppError("Property not found", 404));
  }

  // Check ownership
  if (property.owner_id.toString() !== req.user.id) {
    return next(new AppError("Not authorized to update this property", 403));
  }

  // Handle photo uploads if any
  if (req.files && req.files.length > 0) {
    const newPhotoPaths = req.files.map((file) => `/uploads/${file.filename}`);
    req.body.photos = [...(property.photos || []), ...newPhotoPaths];
  }

  const updatedProperty = await Property.findByIdAndUpdate(
    req.params.id,
    req.body,
    {
      new: true,
      runValidators: true,
    },
  ).populate("owner_id", "name _id");

  logger.info(
    `Property updated: ${updatedProperty.title} by user ${req.user.id}`,
  );

  res.json({
    success: true,
    data: updatedProperty,
  });
});

// @desc    Delete property
// @route   DELETE /api/properties/:id
// @access  Private (Owner only)
exports.deleteProperty = asyncHandler(async (req, res, next) => {
  const property = await Property.findById(req.params.id);

  if (!property) {
    return next(new AppError("Property not found", 404));
  }

  if (property.owner_id.toString() !== req.user.id) {
    return next(new AppError("Not authorized to delete this property", 403));
  }

  await Property.findByIdAndDelete(req.params.id);

  logger.info(`Property deleted: ${property.title} by user ${req.user.id}`);

  res.json({
    success: true,
    message: "Property deleted successfully",
  });
});

// @desc    Toggle featured status
// @route   PATCH /api/properties/:id/feature
// @access  Private (Owner only)
exports.toggleFeatured = asyncHandler(async (req, res, next) => {
  const property = await Property.findById(req.params.id);

  if (!property) {
    return next(new AppError("Property not found", 404));
  }

  if (property.owner_id.toString() !== req.user.id) {
    return next(new AppError("Not authorized to modify this property", 403));
  }

  await property.toggleFeatured();

  res.json({
    success: true,
    data: property,
  });
});

// @desc    Get user's properties
// @route   GET /api/properties/my-properties
// @access  Private
exports.getMyProperties = asyncHandler(async (req, res, next) => {
  const { page = 1, limit = 10 } = req.query;
  const skip = (parseInt(page) - 1) * parseInt(limit);

  const properties = await Property.find({ owner_id: req.user.id })
    .populate("owner_id", "name _id")
    .sort({ created_date: -1 })
    .skip(skip)
    .limit(parseInt(limit));

  const total = await Property.countDocuments({ owner_id: req.user.id });

  res.json({
    success: true,
    count: properties.length,
    total,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      pages: Math.ceil(total / parseInt(limit)),
    },
    data: properties,
  });
});
