"use client";

import Image from "next/image";
import Hero from "@/components/Hero";
import PlaceList from "@/components/PlaceList";
import Header from "@/components/Header"; // ← Make sure Header is imported
import { useEffect, useState } from "react";

export default function Home() {
  const [placeList, setPlaceList] = useState([]);

  useEffect(() => {
    getPlaceList("Hotels in Johannesburg");
  }, []);

  const getPlaceList = async (value: string) => {
    const result = await fetch("/api/google-place-api?q=" + value);
    const data = await result.json();
    console.log(data);
    setPlaceList(data.resp.results);
  };

  return (
    <div>
       <Header userInput={getPlaceList} /> {/* ✅ pass it here */}
      <Hero userInput={getPlaceList} />
      {placeList ? <PlaceList placeList={placeList} /> : null}
    </div>
  );
}
