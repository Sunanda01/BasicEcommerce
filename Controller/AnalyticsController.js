const Order=require('../Model/Order');
const Product=require('../Model/Product');
const User=require('../Model/User');
function getDatesInRange(startDate, endDate) {
	const dates = [];
	let currentDate = new Date(startDate);
	while (currentDate <= endDate) {
		dates.push(currentDate.toISOString().split("T")[0]);
		currentDate.setDate(currentDate.getDate() + 1);
	}
	return dates;
}
const AnalyticsController={
    async getAnalyticsDetails(){
        const totalUsers = await User.countDocuments();
	    const totalProducts = await Product.countDocuments();
        const salesData = await Order.aggregate([
            {
                $group: {
                    _id: null, // it groups all documents together,
                    totalSales: { $sum: 1 },
                    totalRevenue: { $sum: "$totalAmount" },
                },
            },
        ]);
        const { totalSales, totalRevenue } = salesData[0] || { totalSales: 0, totalRevenue: 0 };
        return {
            users: totalUsers,
            products: totalProducts,
            totalSales,
            totalRevenue,
        };
    },

    async getDailySalesData(startDate, endDate){
        try{
            const dailySalesData = await Order.aggregate([
                {
                    $match: {
                        createdAt: {
                            $gte: startDate,
                            $lte: endDate,
                        },
                    },
                },
                {
                    $group: {
                        _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
                        sales: { $sum: 1 },
                        revenue: { $sum: "$totalAmount" },
                    },
                },
                { $sort: { _id: 1 } },
            ]);
            const dateArray = getDatesInRange(startDate, endDate);
            return dateArray.map((date) => {
                const foundData = dailySalesData.find((item) => item._id === date);
                return {
                    date,
                    sales: foundData?.sales || 0,
                    revenue: foundData?.revenue || 0,
                };
            });
        }
        catch(err){
            throw err;
        }
    }
}
module.exports=AnalyticsController;