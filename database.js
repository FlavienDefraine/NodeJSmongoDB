module.exports = {
  // Connect to the database
  connect: function () {
    // Connect to the database
    mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    // Handle errors
    mongoose.connection.on("error", (err) => {
      console.error(`Error connecting to the database: ${err}`);
    });
  },

  // Close the database connection
  close: function () {
    mongoose.connection.close();
  },
};
