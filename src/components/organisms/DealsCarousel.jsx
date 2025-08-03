import React, { useState, useEffect } from "react";
import DealCard from "@/components/molecules/DealCard";
import Loading from "@/components/ui/Loading";
import Error from "@/components/ui/Error";
import { dealsService } from "@/services/api/dealsService";

const DealsCarousel = () => {
  const [deals, setDeals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadDeals = async () => {
    try {
      setLoading(true);
      setError("");
      const data = await dealsService.getActiveDeals();
      setDeals(data);
    } catch (err) {
      setError("Failed to load deals");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDeals();
  }, []);

  if (loading) {
    return (
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-display font-bold text-gray-900 mb-8">
            Active Deals
          </h2>
          <Loading type="deals" />
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Error message={error} onRetry={loadDeals} />
        </div>
      </section>
    );
  }

  if (!deals || deals.length === 0) {
    return null;
  }

  return (
    <section className="py-12 bg-gradient-to-br from-gray-50 to-primary-50/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-3xl font-display font-bold text-gray-900 mb-8">
          🔥 Active Deals
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {deals.map((deal) => (
            <DealCard key={deal.Id} deal={deal} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default DealsCarousel;