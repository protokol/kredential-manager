export default async function makeRequest(url: string, options: RequestInit) {
    try {
        const response = await fetch(url, options);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return await response.json(); // Assuming JSON response. Adjust if necessary.
    } catch (error) {
        console.error("Fetch error: ", error);
        throw error;
    }
}

// export default async function makeRequest(url: string, method: string, headers: HeadersInit, body?: any,) {

//     // console.log(`Making ${method} request to: ${url}`);

//     const requestHeaders = new Headers(headers);
//     requestHeaders.set('Content-Type', 'application/x-www-form-urlencoded');

//     if (requestHeaders.get('Content-Type') === 'application/x-www-form-urlencoded' && body && typeof body === 'object') {
//         body = new URLSearchParams(body)
//     }

//     try {
//         const response = await fetch(url, {
//             method,
//             headers: new Headers(headers),
//             body: method == 'GET' ? null : body,
//             redirect: 'manual'
//         });
//         if (response.status == 302) {
//             return response
//         }

//         if (!response.ok) {
//             const errorText = await response.json();
//             throw new Error(`Network response was not ok: ${response.status} ${response.statusText}. Error: ${errorText}`);
//         }

//         if (!response.ok) {
//             throw new Error('Network response was not ok');
//         }

//         return response.json(); // Or .text() if you expect a non-JSON response
//     } catch (error) {
//         console.error('Error:', error);
//         throw error;
//     }
//     // console.log(`Making ${method} request to: ${url}`);
//     // const headerData = new Headers(headers);
//     // // const requestBody = body ? JSON.stringify(body) : null;
//     // const requestBody = body ? body : null;

//     // console.log({ requestBody });

//     // try {
//     //     const response = await fetch(url, {
//     //         method,
//     //         headers: headerData,
//     //         body: requestBody,
//     //         redirect: 'manual'
//     //     });

//     //     if (response.status == 302) {
//     //         return response
//     //     }

//     //     if (!response.ok) {
//     //         const errorText = await response.json();
//     //         throw new Error(`Network response was not ok: ${response.status} ${response.statusText}. Error: ${errorText}`);
//     //     }
//     //     return response;
//     // } catch (error) {
//     //     console.error('Error:', error);
//     //     throw error;
//     // }
// }