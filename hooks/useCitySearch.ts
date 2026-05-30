"use client";

import { useQuery } from "@tanstack/react-query";
import { searchCities } from "@/lib/open-meteo";

export function useCitySearch(query: string) {
  return useQuery({
    queryKey: ["city-search", query],
    queryFn: () => searchCities(query),
    enabled: query.trim().length >= 2,
    staleTime: 60 * 1000,
  });
}
