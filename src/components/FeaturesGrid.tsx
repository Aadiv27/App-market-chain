
import { motion } from 'framer-motion';
import { Store, Package, Truck, Search, Bell, BarChart3, Globe, Smartphone } from 'lucide-react';

const FeaturesGrid = () => {
  const features = [
    {
      category: "For Retailers",
      icon: Store,
      color: "bg-[#5DAE49]",
      items: [
        { icon: Search, title: "Easy Product Discovery", description: "AI-powered search in Hindi/English" },
        { icon: Package, title: "Bulk Orders", description: "Volume discounts and flexible payment" },
        { icon: Smartphone, title: "COD Options", description: "Cash on delivery for all orders" }
      ]
    },
    {
      category: "For Wholesalers",
      icon: Package,
      color: "bg-[#FFC947]",
      items: [
        { icon: BarChart3, title: "Inventory Sync", description: "Real-time stock management" },
        { icon: Bell, title: "AI Restocking Alerts", description: "Predictive demand analysis" },
        { icon: Globe, title: "Market Insights", description: "Regional demand patterns" }
      ]
    },
    {
      category: "For Vehicle Owners",
      icon: Truck,
      color: "bg-[#5DAE49]",
      items: [
        { icon: Truck, title: "Route Optimization", description: "AI-powered delivery routes" },
        { icon: Package, title: "Reverse Logistics", description: "Return pickup management" },
        { icon: BarChart3, title: "Milestone Payments", description: "Automated payment processing" }
      ]
    }
  ];

  return (
    <section className="py-20 bg-gradient-to-br from-[#FAF3E0] to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-[#0D1B2A] mb-4">
            Role-based Features
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Tailored solutions for every participant in the rural supply chain
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.2 }}
              viewport={{ once: true }}
              className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden"
            >
              {/* Header */}
              <div className={`${feature.color} p-6 text-white`}>
                <div className="flex items-center space-x-3 mb-4">
                  <feature.icon className="h-8 w-8" />
                  <h3 className="text-xl font-bold">{feature.category}</h3>
                </div>
              </div>

              {/* Features List */}
              <div className="p-6 space-y-6">
                {feature.items.map((item, itemIndex) => (
                  <div key={itemIndex} className="flex items-start space-x-4">
                    <div className="flex-shrink-0 w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                      <item.icon className="h-5 w-5 text-[#0D1B2A]" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-[#0D1B2A] mb-1">{item.title}</h4>
                      <p className="text-gray-600 text-sm">{item.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          ))}
        </div>

        {/* Additional Features Strip */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.8 }}
          viewport={{ once: true }}
          className="mt-16 bg-white rounded-2xl shadow-lg p-8"
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div>
              <div className="w-12 h-12 bg-[#5DAE49] rounded-lg flex items-center justify-center mx-auto mb-4">
                <Globe className="h-6 w-6 text-white" />
              </div>
              <h4 className="font-semibold text-[#0D1B2A] mb-2">10+ Languages</h4>
              <p className="text-gray-600 text-sm">Regional language support including Hindi, Bengali, Tamil</p>
            </div>
            <div>
              <div className="w-12 h-12 bg-[#FFC947] rounded-lg flex items-center justify-center mx-auto mb-4">
                <Smartphone className="h-6 w-6 text-white" />
              </div>
              <h4 className="font-semibold text-[#0D1B2A] mb-2">Offline Support</h4>
              <p className="text-gray-600 text-sm">Works in low-network zones with data sync</p>
            </div>
            <div>
              <div className="w-12 h-12 bg-[#5DAE49] rounded-lg flex items-center justify-center mx-auto mb-4">
                <Bell className="h-6 w-6 text-white" />
              </div>
              <h4 className="font-semibold text-[#0D1B2A] mb-2">Smart Notifications</h4>
              <p className="text-gray-600 text-sm">WhatsApp, SMS, and in-app alerts</p>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default FeaturesGrid;