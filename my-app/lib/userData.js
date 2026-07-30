// my-app/lib/userData.js

import { getToken } from "./authenticate";

async function fetchData(url, method = "GET", body = null) {
    const token = getToken();
    const headers = {
        "Authorization": `JWT ${token}`
    };

    if (body) {
        headers["Content-Type"] = "application/json";
    }

    try {
        const options = {
            method: method,
            headers: headers
        };

        // Include the body only for non-GET requests
        if (method !== "GET" && body) {
            options.body = JSON.stringify(body);
        }

        const response = await fetch(url, options);

        if (response.ok) {
            return await response.json();
        } else {
            console.error('Error fetching data:', response.statusText);
            return [];
        }
    } catch (error) {
        console.error('Error fetching data:', error);
        return [];
    }
}

export async function addToFavourites(id) {
    return await fetchData(`${process.env.NEXT_PUBLIC_API_URL}/favourites/${id}`, "PUT");
}

export async function removeFromFavourites(id) {
    return await fetchData(`${process.env.NEXT_PUBLIC_API_URL}/favourites/${id}`, "DELETE");
}

export async function getFavourites() {
    return await fetchData(`${process.env.NEXT_PUBLIC_API_URL}/favourites`);
}

export async function addToHistory(id) {
    return await fetchData(`${process.env.NEXT_PUBLIC_API_URL}/history/${id}`, "PUT");
}

export async function removeFromHistory(id) {
    return await fetchData(`${process.env.NEXT_PUBLIC_API_URL}/history/${id}`, "DELETE");
}

export async function getHistory() {
    return await fetchData(`${process.env.NEXT_PUBLIC_API_URL}/history`);
}
