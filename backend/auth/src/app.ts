import express from 'express';
import cors from 'cors'
import authRoutes from './routes/authRoutes'

const app = express();
app.use(cors());
app.use(express.json())

app.use('/api/auth', authRoutes);

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => [
	console.log(`Auth Service listening on port ${PORT}`)
])