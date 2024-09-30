# Train App - Get your train at the cheapest price

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)

**NOTE**: the project is for styuding, fun and personal purpose only. Please contact Omio for real API.

This project is a scraper designed to pull data from [Omio.com](https://www.omio.com/) for trains, flights, and buses for a specified route. It helps users monitor and compare prices, sending notifications when cheaper travel options become available.

## Features

- Scrapes train, flight, and bus prices from Omio.com
- Monitors specific routes over time
- Sends notifications when cheaper travel options are found
- Easy to set up and customize for different routes
- Lightweight and efficient
- Comes with Prisma with MongoDB and LavinMQ

## How It Works

1. **Input the route**: Define the start and end destinations.
2. **Scrape prices**: The scraper will collect all the available train, flight, and bus prices for that route.
3. **Monitor for cheaper options**: The system will continuously monitor prices and notify you when it finds a lower fare.
4. **Notification system**: You'll receive a notification (by email) when a cheaper option is available.

## Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/TheJoin95/train-app.git
   cd train-app
   ```

2. Install the dependencies
   
    ```bash
    npm i
    ```
3. Configure your environemnt
  
  You need to setup your environment with MongoDB, your queue system and your smpt server in the following env variables:

  ```bash
  MONGODB_USER
  MONGODB_PASSWORD
  SNCF_API_TOKEN
  DATABASE_URL
  CLOUDAMQP_URL
  GMAIL_USER
  GMAIL_PWD
  ```

  I personally created a MongoDB instance with MongoDB Atlas and used CloudAMQP to create the LavinMQ.
  Of course I've used my personal gmail for notification.
4. Sync your Prisma with your DB
5. Add some record in the times collection such as like:
  ```bash
  {
  "outbound": {
    "stations": {
      "departure": "Paris",
      "arrival": "Rennes"
    },
    "date": {
      "$date": "2024-11-01T10:15:00.000Z"
    }
  },
  "inbound": {
    "stations": {
      "departure": "Rennes",
      "arrival": "Paris"
    },
    "date": {
      "$date": "2024-11-03T10:15:00.000Z"
    }
  }
}
  ```
6. Run `./run-producer.sh`
7. Run `./run-queue.sh`



# License

MIT
