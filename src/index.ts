import express, {
    type Request,
    type Response,
} from 'express';
import cors from 'cors';
import fetch, {
    type Response as FetchResponse,
} from 'node-fetch';

const PORT: number = 3000;

const BASE_URL = process.env.BASE_URL;
const MANIFEST_URL = process.env.MANIFEST_URL;

if (!BASE_URL || !MANIFEST_URL) {
    throw new Error('BASE_URL and MANIFEST_URL must be provided');
}

const app = express();
app.use(cors());

const proxyManifest = async (res: Response) => {
    let response: FetchResponse | null = null;

    try {
        response = await fetch(MANIFEST_URL);

        if (!response.ok || !response.body) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        response.body.pipe(res);
    } catch (error: unknown) {
        console.error(error);

        res.status(500).send(error?.toString());
    }
}

const proxyFragment = async (req: Request, res: Response) => {
    let response: FetchResponse | null = null;

    try {
        response = await fetch(`${BASE_URL}${req.url}`);

        if (!response.ok || !response.body) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        response.body.pipe(res);
    } catch (error: unknown) {
        console.error(error);

        res.status(500).send(error?.toString());
    }
}

app.get(
    '/*',
    async (req: Request, res: Response): Promise<void> => {
        if (req.url.endsWith('.mpd')) {
            proxyManifest(res);

            return;
        }

        proxyFragment(req, res);
    },
);

app.listen(
    PORT,
    (): void => {
        console.log(`Server running at http://localhost:${PORT}`);
    },
);
