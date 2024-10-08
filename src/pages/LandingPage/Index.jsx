import React, { useEffect, useState } from "react";
import axios from "axios";
import { Stack, Typography } from "@mui/material";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import Groq from "groq-sdk";

// Custom tooltip for the line chart
const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const date = new Date(payload[0].payload.date);
    const formattedDate = `${date.getDate()}/${
      date.getMonth() + 1
    }/${date.getFullYear()}`;

    return (
      <div className="bg-white card">
        <p className="label">{`Date: ${formattedDate}`}</p>
        <p className="intro">{`Price (USD): $${payload[0].value.toLocaleString(
          "en-US",
          {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          }
        )}`}</p>
      </div>
    );
  }

  return null;
};

function LandingPage() {
  const [prices, setPrices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [response, setResponse] = useState(null); // State for AI response

  // Initialize Groq client
  const client = new Groq({
    apiKey: "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",
    dangerouslyAllowBrowser: true,
  });

  const API_KEY = "CG-iLxuXPvWEVcQkAQySPsMFzYt";

  useEffect(() => {
    const fetchBitcoinPrices = async () => {
      try {
        const endDate = Math.floor(Date.now() / 1000);
        const startDate = endDate - 365 * 24 * 60 * 60;

        const response = await axios.get(
          `https://api.coingecko.com/api/v3/coins/bitcoin/market_chart/range?x_cg_demo_api_key=${API_KEY}`,
          {
            params: {
              vs_currency: "usd",
              from: startDate,
              to: endDate,
            },
            headers: {
              Authorization: `Bearer ${API_KEY}`,
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
            dailyPricesMap.set(date, value);
          }
        });

        // Convert Map to an array of objects
        const dailyPrices = Array.from(dailyPricesMap, ([date, value]) => ({
          date,
          value,
        }));

        setPrices(dailyPrices);

        handleAIRequest();
      } catch (err) {
        setError("Failed to fetch Bitcoin prices");
      } finally {
        setLoading(false);
      }
    };

    fetchBitcoinPrices();
  }, []);

  // Function to handle AI prompt submission
  const handleAIRequest = async () => {
    try {
      const dataToPrepend = JSON.stringify(prices);
      const combinedInput = `${dataToPrepend}\n. The JSON string is the Bitcoin prices the past year. Tell me predictions of Bitcoin prices moving forward write in a 100 word paragraph. Make it straight to the point, don't add preface`;

      const chatCompletion = await client.chat.completions.create({
        messages: [{ role: "user", content: combinedInput }],
        model: "llama3-8b-8192",
      });
      setResponse(chatCompletion.choices[0].message.content);
    } catch (err) {
      setResponse("Failed to fetch response from AI.");
    }
  };

  if (loading) {
    return <Typography variant="h6">Loading...</Typography>;
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
        <div className="text-3xl font-semibold mb-2 md:mt-20">
          Bitcoin Market Overview
        </div>
        <div className="flex flex-col md:flex-row  md:space-x-5 ">
          <Stack spacing={0} className="md:w-1/2 md:card">
            <div className="text-2xl font-semibold">Prices - Year-to-Date</div>
            <div className="text-end text-sm mt-2 text-gray-500">
              Powered by CoinGecko API
            </div>

            {/* Line Chart for Bitcoin Prices */}
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={prices}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="date"
                  tickFormatter={(date) => {
                    const options = { month: "short", year: "2-digit" };
                    return new Date(date).toLocaleString("en-US", options);
                  }}
                  tick={{ fontSize: 13 }}
                />
                <YAxis
                  tickFormatter={(value) => value.toLocaleString("en-US")}
                  tick={{ fontSize: 13 }}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend formatter={() => "Price (USD)"} />
                <Line
                  type="monotone"
                  dataKey="value"
                  stroke="#77c322"
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </Stack>

          {/* Right card for Groq AI functionality */}
          <Stack spacing={0} className="md:w-1/2 md:card mt-5 md:mt-0">
            <div className="text-2xl font-semibold ">AI Price Predictions</div>
            <div className="text-end text-sm mt-2 text-gray-500">
              Powered by Groq AI
            </div>
            <div className="card min-h-[200px] max-h-[300px] overflow-y-auto">
              <p className="text-justify">{response}</p>
            </div>
          </Stack>
        </div>
      </div>
    </>
  );
}

export default LandingPage;
