const cron = require("node-cron");
const Music = require("../models/musicModel");

cron.schedule("* * * * *", async () => {
    try {
        const cutoffDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
        // const cutoffDate = new Date(Date.now() - 2 * 60 * 1000); 

        await Music.deleteMany({
            isDeleted: true,
            deletedAt: { $lte: cutoffDate }
        });

        console.log("Cron job is running..!");
    } catch (error) {
        console.error("Cron job error:", error.message);
    }
});
