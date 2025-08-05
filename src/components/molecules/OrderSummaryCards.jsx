import React from "react";
import { formatPrice } from "@/services/currency.formatter";
import ApperIcon from "@/components/ApperIcon";
import Badge from "@/components/atoms/Badge";

const OrderSummaryCards = ({ statistics }) => {

  const cards = [
    {
      title: 'Pending Verification',
      value: statistics.pendingVerification,
      icon: 'Clock',
      color: 'from-warning-100 to-warning-200',
      textColor: 'text-warning-700',
      iconColor: 'text-warning-600'
    },
    {
      title: 'Verified Payments',
      value: statistics.verifiedPayments,
      icon: 'CheckCircle',
      color: 'from-info-100 to-info-200',
      textColor: 'text-info-700',
      iconColor: 'text-info-600'
    },
    {
      title: 'Packed Orders',
      value: statistics.packedOrders,
      icon: 'Box',
      color: 'from-secondary-100 to-secondary-200',
      textColor: 'text-secondary-700',
      iconColor: 'text-secondary-600'
    },
    {
      title: 'Shipped Deliveries',
      value: statistics.shippedDeliveries,
      icon: 'Truck',
      color: 'from-accent-100 to-accent-200',
      textColor: 'text-accent-700',
      iconColor: 'text-accent-600'
    },
    {
      title: "Today's Deliveries",
      value: statistics.todayDeliveries,
      icon: 'MapPin',
      color: 'from-success-100 to-success-200',
      textColor: 'text-success-700',
      iconColor: 'text-success-600'
    },
{
      title: 'Total Revenue',
      value: formatPrice(statistics.totalRevenue),
      icon: 'IndianRupee',
      color: 'from-primary-100 to-primary-200',
      textColor: 'text-primary-700',
      iconColor: 'text-primary-600',
      subtitle: `Today: ${formatPrice(statistics.todayRevenue)}`
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6 mb-8">
      {cards.map((card, index) => (
        <div
          key={index}
          className={`bg-gradient-to-br ${card.color} rounded-xl p-6 shadow-premium hover:shadow-premium-lg transition-shadow`}
        >
          <div className="flex items-center justify-between mb-4">
            <div className={`w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center`}>
              <ApperIcon name={card.icon} className={`w-5 h-5 ${card.iconColor}`} />
            </div>
            {index === 0 && statistics.pendingVerification > 0 && (
              <Badge variant="warning" size="sm">
                Action Needed
              </Badge>
            )}
          </div>
          
          <div>
            <h3 className={`text-2xl font-bold ${card.textColor} mb-1`}>
              {card.value}
            </h3>
            <p className={`text-sm ${card.textColor}/80 font-medium`}>
              {card.title}
            </p>
            {card.subtitle && (
              <p className={`text-xs ${card.textColor}/60 mt-1`}>
                {card.subtitle}
              </p>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

export default OrderSummaryCards;