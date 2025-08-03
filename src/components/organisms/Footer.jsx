import React from "react";
import { Link } from "react-router-dom";
import ApperIcon from "@/components/ApperIcon";

const Footer = () => {
  const footerLinks = {
    "Shop": [
      { name: "All Categories", path: "/categories" },
      { name: "Fresh Fruits", path: "/categories/Fruits" },
      { name: "Vegetables", path: "/categories/Vegetables" },
      { name: "Dairy Products", path: "/categories/Dairy" },
      { name: "Organic Foods", path: "/categories?tags=Organic" }
    ],
    "Support": [
      { name: "Help Center", path: "/help" },
      { name: "Contact Us", path: "/contact" },
      { name: "Delivery Info", path: "/delivery" },
      { name: "Returns", path: "/returns" },
      { name: "FAQ", path: "/faq" }
    ],
    "Company": [
      { name: "About Us", path: "/about" },
      { name: "Our Farmers", path: "/farmers" },
      { name: "Careers", path: "/careers" },
      { name: "Press", path: "/press" },
      { name: "Blog", path: "/blog" }
    ]
  };

  const deliveryAreas = [
    "Downtown", "Midtown", "Uptown", "East Side", "West End", "North Park"
  ];

  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-accent-500 rounded-lg flex items-center justify-center">
                <ApperIcon name="Leaf" className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="font-display font-bold text-xl">FreshMart Pro</h2>
                <p className="text-sm text-gray-400">Farm to Table</p>
              </div>
            </div>
            <p className="text-gray-400 text-sm">
              Connecting local farmers with urban consumers for the freshest groceries delivered right to your door.
            </p>
            <div className="flex space-x-4">
              <ApperIcon name="Facebook" className="w-5 h-5 text-gray-400 hover:text-white cursor-pointer transition-colors" />
              <ApperIcon name="Twitter" className="w-5 h-5 text-gray-400 hover:text-white cursor-pointer transition-colors" />
              <ApperIcon name="Instagram" className="w-5 h-5 text-gray-400 hover:text-white cursor-pointer transition-colors" />
            </div>
          </div>

          {/* Links */}
          {Object.entries(footerLinks).map(([category, links]) => (
            <div key={category}>
              <h3 className="font-display font-semibold text-lg mb-4">{category}</h3>
              <ul className="space-y-2">
                {links.map((link) => (
                  <li key={link.name}>
                    <Link 
                      to={link.path}
                      className="text-gray-400 hover:text-white transition-colors text-sm"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          {/* Delivery Areas */}
          <div>
            <h3 className="font-display font-semibold text-lg mb-4">Delivery Areas</h3>
            <div className="grid grid-cols-2 gap-2">
              {deliveryAreas.map((area) => (
                <div key={area} className="flex items-center space-x-1">
                  <ApperIcon name="MapPin" className="w-3 h-3 text-primary-400" />
                  <span className="text-gray-400 text-sm">{area}</span>
                </div>
              ))}
            </div>
            <div className="mt-4 p-3 bg-primary-900/30 rounded-lg">
              <div className="flex items-center space-x-2 mb-2">
                <ApperIcon name="Truck" className="w-4 h-4 text-primary-400" />
                <span className="text-sm font-medium">Free Delivery</span>
              </div>
              <p className="text-xs text-gray-400">On orders over ₹500</p>
            </div>
          </div>
        </div>

        {/* Bottom */}
        <div className="border-t border-gray-800 mt-8 pt-8 flex flex-col sm:flex-row justify-between items-center">
          <p className="text-gray-400 text-sm">
            © 2024 FreshMart Pro. All rights reserved.
          </p>
          <div className="flex space-x-6 mt-4 sm:mt-0">
            <Link to="/privacy" className="text-gray-400 hover:text-white text-sm transition-colors">
              Privacy Policy
            </Link>
            <Link to="/terms" className="text-gray-400 hover:text-white text-sm transition-colors">
              Terms of Service
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;