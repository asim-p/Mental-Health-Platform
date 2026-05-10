const mongoose = require("mongoose");

const propertySchema = new mongoose.Schema(
  {
    owner_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Owner ID is required"],
    },
    title: {
      type: String,
      required: [true, "Title is required"],
      trim: true,
      minlength: [5, "Title must be at least 5 characters long"],
      maxlength: [100, "Title cannot exceed 100 characters"],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [1000, "Description cannot exceed 1000 characters"],
    },
    price: {
      type: Number,
      required: [true, "Price is required"],
      min: [0, "Price cannot be negative"],
    },
    location: {
      type: String,
      required: [true, "Location is required"],
      trim: true,
      minlength: [3, "Location must be at least 3 characters long"],
      maxlength: [100, "Location cannot exceed 100 characters"],
    },
    property_type: {
      type: String,
      enum: {
        values: ["room", "apartment", "house"],
        message: "Property type must be room, apartment, or house",
      },
      required: [true, "Property type is required"],
    },
    bedrooms: {
      type: Number,
      min: [0, "Bedrooms cannot be negative"],
      max: [20, "Bedrooms cannot exceed 20"],
    },
    bathrooms: {
      type: Number,
      min: [0, "Bathrooms cannot be negative"],
      max: [20, "Bathrooms cannot exceed 20"],
    },
    photos: [
      {
        type: String,
        validate: {
          validator: function (v) {
            return /^\/uploads\/.+\.(jpg|jpeg|png|webp)$/i.test(v);
          },
          message: "Invalid photo URL format",
        },
      },
    ],
    status: {
      type: String,
      enum: {
        values: ["available", "rented", "maintenance"],
        message: "Status must be available, rented, or maintenance",
      },
      default: "available",
    },
    amenities: [
      {
        type: String,
        enum: [
          "wifi",
          "parking",
          "kitchen",
          "laundry",
          "ac",
          "heating",
          "balcony",
          "garden",
          "security",
          "elevator",
          "furnished",
        ],
      },
    ],
    square_feet: {
      type: Number,
      min: [0, "Square feet cannot be negative"],
    },
    is_featured: {
      type: Boolean,
      default: false,
    },
    views: {
      type: Number,
      default: 0,
    },
    created_date: {
      type: Date,
      default: Date.now,
    },
    updated_date: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: { createdAt: "created_date", updatedAt: "updated_date" },
  },
);

// Indexes for better query performance
propertySchema.index({ location: 1 });
propertySchema.index({ price: 1 });
propertySchema.index({ property_type: 1 });
propertySchema.index({ status: 1 });
propertySchema.index({ owner_id: 1 });
propertySchema.index({ is_featured: 1 });
propertySchema.index({ created_date: -1 });

// Compound indexes for common queries
propertySchema.index({ location: 1, price: 1 });
propertySchema.index({ property_type: 1, status: 1 });
propertySchema.index({ location: 1, property_type: 1, price: 1 });

// Virtual for property age
propertySchema.virtual("age").get(function () {
  return Math.floor((Date.now() - this.created_date) / (1000 * 60 * 60 * 24));
});

// Instance method to increment views
propertySchema.methods.incrementViews = function () {
  this.views += 1;
  return this.save();
};

// Instance method to toggle featured status
propertySchema.methods.toggleFeatured = function () {
  this.is_featured = !this.is_featured;
  return this.save();
};

// Static method to get featured properties
propertySchema.statics.getFeatured = function (limit = 10) {
  return this.find({ is_featured: true, status: "available" })
    .populate("owner_id", "name _id")
    .limit(limit)
    .sort({ created_date: -1 });
};

// Static method to search properties
propertySchema.statics.search = function (filters = {}, page = 1, limit = 10) {
  const skip = (page - 1) * limit;

  let query = this.find(filters)
    .populate("owner_id", "name _id")
    .sort({ created_date: -1 })
    .skip(skip)
    .limit(limit);

  return query;
};

// Ensure virtual fields are serialized
propertySchema.set("toJSON", { virtuals: true });
propertySchema.set("toObject", { virtuals: true });

module.exports = mongoose.model("Property", propertySchema);
