import React, { useEffect, useState } from "react";
import axios from "axios";
import { TextField, Button, Stack, Typography, Skeleton } from "@mui/material";

function LandingPage() {
  const [prices, setPrices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchBitcoinPrices = async () => {
      try {
        const endDate = Math.floor(Date.now() / 1000); // Current timestamp
        const startDate = endDate - 7 * 24 * 60 * 60; // 7 days ago in seconds

        const response = await axios.get(
          `https://api.coingecko.com/api/v3/coins/bitcoin/market_chart/range`,
          {
            params: {
              vs_currency: "myr",
              from: startDate,
              to: endDate,
            },
          }
        );

        // Use a Map to aggregate prices by date
        const dailyPricesMap = new Map();

        response.data.prices.forEach((price) => {
          const date = new Date(price[0]).toLocaleDateString();
          const value = price[1];

          // Store the latest price for each date
          if (!dailyPricesMap.has(date)) {
            dailyPricesMap.set(date, value);
          } else {
            dailyPricesMap.set(date, value); // You could change this logic to store the highest or lowest price if desired
          }
        });

        // Convert Map to an array of objects
        const dailyPrices = Array.from(dailyPricesMap, ([date, value]) => ({
          date,
          value,
        }));

        setPrices(dailyPrices);
      } catch (err) {
        setError("Failed to fetch Bitcoin prices");
      } finally {
        setLoading(false);
      }
    };

    fetchBitcoinPrices();
  }, []);

  if (loading) {
    return (
      <>
        <Skeleton variant="circular" width={40} height={40} />
        <Skeleton variant="rectangular" width={210} height={60} />
        <Skeleton variant="rounded" width={210} height={60} />
      </>
    );
  }

  if (error) {
    return (
      <Typography variant="h6" color="error">
        {error}
      </Typography>
    );
  }

  return (
    <>
      <div className="centered-container">
        <Stack spacing={2} className="md:w-1/2">
          <TextField
            id="outlined-basic"
            label="Outlined"
            variant="outlined"
            className="w-full"
            size="small"
          />

          <Button variant="contained" className="w-full" size="medium">
            Contained
          </Button>

          <Typography variant="h6">
            Bitcoin Prices for the Past 7 Days:
          </Typography>
          {prices.map((price, index) => (
            <Typography key={index}>
              {price.date}: ${price.value.toFixed(2)}
            </Typography>
          ))}
        </Stack>
      </div>
    </>
  );
}

export default LandingPage;
