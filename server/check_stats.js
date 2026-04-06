const mongoose = require('mongoose');
const Result = require('./models/Result');
const dotenv = require('dotenv');

dotenv.config();

async function check() {
    await mongoose.connect(process.env.MONGODB_URI);

    const total = await Result.countDocuments({});
    const submitted = await Result.countDocuments({ submitted: true });
    const unsubmitted = await Result.countDocuments({ submitted: false });
    console.log(`Total: ${total}, Submitted: ${submitted}, Unsubmitted: ${unsubmitted}`);

    await mongoose.disconnect();
}

check().catch(console.error);
