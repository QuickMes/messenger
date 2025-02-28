import cors from 'cors';
import express from 'express';
import newsFeedRoutes from './routes/newsFeedRoutes';

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api/newsfeed', newsFeedRoutes);

const PORT = process.env.PORT || 7100;
app.listen(PORT, () => {
	console.log(`News Feed Service is running on port ${PORT}`);
});
