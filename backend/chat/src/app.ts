import cors from 'cors';
import express from 'express';
import chatRoutes from './routes/chatRoutes';

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api/chats', chatRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
	console.log(`Chat Service is running on port ${PORT}`);
});
