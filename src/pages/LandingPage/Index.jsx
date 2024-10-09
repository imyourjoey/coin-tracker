import React, { useEffect, useState } from "react";
import axios from "axios";
import { Stack, Typography, Skeleton } from "@mui/material";
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
import IconLoading from "../../assets/Icons/IconLoading";
import IconSomethingWentWrong from "@/assets/Icons/IconSomethingWentWrong.jsx";

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
      const endDate = Math.floor(Date.now() / 1000);
      const startDate = endDate - 365 * 24 * 60 * 60;

      const startDateString = new Date(startDate * 1000).toISOString();
      const endDateString = new Date(endDate * 1000).toISOString();
      const dataToPrepend = JSON.stringify(prices);
      const combinedInput = `${dataToPrepend}\n. Data before this sentence are bitcoin prices from ${startDateString} to ${endDateString}, Analyse the data very very carefully. you must provide specific price predictions for Bitcoin moving forward. Write a straightforward, 100-word paragraph with actual price estimates, no preface or unnecessary details.`;

      const chatCompletion = await client.chat.completions.create({
        messages: [
          // {
          //   role: "system",
          //   content:
          //     "You are a bitcoin expert and technical analyst, please analyse carefully and you must answer the question stated.",
          // },
          { role: "user", content: combinedInput },
        ],
        model: "mixtral-8x7b-32768",
      });
      setResponse(chatCompletion.choices[0].message.content);
    } catch (err) {
      setResponse("Failed to fetch response from AI.");
    }
  };

  if (loading) {
    return (
      <div className="centered-container">
        <div className="w-full flex flex-col items-center mt-20">
          <IconLoading width="300" height="350" />
          <div className="text-3xl animate-pulse ">Loading...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="centered-container">
        <div className="w-full flex flex-col items-center mt-20 animate-pulse">
          <IconSomethingWentWrong width="300" height="350" />
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="centered-container">
        <div className="text-3xl font-semibold mb-2 md:mt-20">
          <span className="text-[#77c322] text-3xl font-semibold">BitView</span>
          - Bitcoin Market Overview
        </div>
        <div className="flex flex-col md:flex-row  md:space-x-5">
          <Stack
            spacing={0}
            className="md:w-1/2 md:card md:shadow-md mt-8 md:mt-0"
          >
            <div className="text-2xl font-semibold">
              Prices - Last 12 Months
            </div>
            <div className="text-end text-sm mt-2 text-gray-500">
              Powered by{" "}
              <a
                href="https://www.coingecko.com/en/api"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-500 underline hover:text-[#77c322]"
              >
                CoinGecko API
              </a>
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
          <Stack
            spacing={0}
            className="md:w-1/2 md:card mt-8 md:mt-0  md:shadow-md "
          >
            <div className="text-2xl font-semibold ">AI Price Predictions</div>
            <div className="text-end text-sm mt-2 text-gray-500">
              Powered by{" "}
              <a
                href="https://console.groq.com/docs/quickstart"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-500 underline hover:text-[#77c322]"
              >
                Groq AI
              </a>
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
