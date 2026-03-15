
const apiKey = "AIzaSyAg1pzxYZ3XLJ6RjgwhAvJTe843cznUwG4";
const BASE_URL = 'https://jsonplaceholder.typicode.com';

export async function traducirATextoEspanol(textos) {
    try {
        const prompt = `Traduce los siguientes títulos de publicaciones al español de forma natural: ${JSON.stringify(textos)}. Devuelve solo un array JSON con los strings traducidos.`;
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{ parts: [{ text: prompt }] }],
                generationConfig: { responseMimeType: "application/json" }
            })
        });

        if (!response.ok) throw new Error('Error en la traducción AI');

        const data = await response.json();
        return JSON.parse(data.candidates[0].content.parts[0].text);
    } catch (e) {
        console.warn("Falla traducción AI, usando original:", e);
        return textos;
    }
}

/**
 * Obtiene la lista de usuarios
 */
export async function obtenerUsuarios() {
    const respuesta = await fetch(`${BASE_URL}/users`);
    if (!respuesta.ok) throw new Error(`Status ${respuesta.status}`);
    return await respuesta.json();
}

/**
 * Obtiene las publicaciones de un usuario específico y las traduce
 */
export async function obtenerPostsDeUsuario(userId) {
    const res = await fetch(`${BASE_URL}/posts?userId=${userId}`);
    if (!res.ok) throw new Error(`Status ${res.status}`);
    const posts = await res.json();

    // Tomamos los 3 primeros y traducimos sus títulos
    const topPosts = posts.slice(0, 3);
    const titulosOriginales = topPosts.map(p => p.title);
    const titulosTraducidos = await traducirATextoEspanol(titulosOriginales);

    return topPosts.map((p, idx) => ({
        ...p,
        title: titulosTraducidos[idx] || p.title
    }));
}