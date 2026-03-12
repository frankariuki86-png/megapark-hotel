const fs = require('fs');
const path = require('path');

const logger = require('../services/logger');

/**
 * Initialize JSON data files with default seed data if they don't exist or are corrupted
 */
const initializeDataFiles = (dataDir, readJSON, writeJSON) => {
  const defaultRooms = [
    {
      id: 'room-001',
      roomNumber: '101',
      name: 'Deluxe Room',
      type: 'deluxe',
      description: 'Spacious room with premium amenities',
      pricePerNight: 5000,
      capacity: 2,
      amenities: ['Free WiFi', 'Air Conditioning', 'Smart TV', 'Private Bathroom', 'Hot Shower'],
      images: [],
      availability: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: 'room-002',
      roomNumber: '102',
      name: 'Standard Room',
      type: 'standard',
      description: 'Comfortable room with essential amenities',
      pricePerNight: 3000,
      capacity: 2,
      amenities: ['WiFi', 'Air Conditioning', 'Private Bathroom'],
      images: [],
      availability: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
  ];

  const defaultHalls = [
    {
      id: 'hall-001',
      name: 'Grand Ballroom',
      description: 'Spacious hall for weddings and large events',
      capacity: 500,
      pricePerDay: 50000,
      amenities: ['AC', 'WiFi', 'Sound System', 'Stage'],
      images: [],
      availability: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: 'hall-002',
      name: 'Conference Room',
      description: 'Modern meeting space for corporate events',
      capacity: 150,
      pricePerDay: 15000,
      amenities: ['WiFi', 'Projector', 'Video Conference Setup', 'AC'],
      images: [],
      availability: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
  ];

  try {
    const roomsPath = path.join(dataDir, 'rooms.json');
    const hallsPath = path.join(dataDir, 'halls.json');

    // Initialize rooms
    try {
      const rooms = readJSON(roomsPath, null);
      if (!rooms || !Array.isArray(rooms) || rooms.length === 0) {
        logger.info('[dataInit] Initializing rooms with default data');
        writeJSON(roomsPath, defaultRooms);
      } else {
        logger.info('[dataInit] Rooms file exists with', rooms.length, 'entries');
      }
    } catch (err) {
      logger.warn('[dataInit] Error reading rooms, reinitializing:', err.message);
      writeJSON(roomsPath, defaultRooms);
    }

    // Initialize halls
    try {
      const halls = readJSON(hallsPath, null);
      if (!halls || !Array.isArray(halls) || halls.length === 0) {
        logger.info('[dataInit] Initializing halls with default data');
        writeJSON(hallsPath, defaultHalls);
      } else {
        logger.info('[dataInit] Halls file exists with', halls.length, 'entries');
      }
    } catch (err) {
      logger.warn('[dataInit] Error reading halls, reinitializing:', err.message);
      writeJSON(hallsPath, defaultHalls);
    }

    logger.info('[dataInit] Data files initialization complete');
  } catch (err) {
    logger.error('[dataInit] Fatal error during initialization:', err.message);
    throw err;
  }
};

module.exports = { initializeDataFiles };
