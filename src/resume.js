const BASE_URL = process.env.REACT_APP_API_BASE_URL

export async function getAllResumes() {
    const url = `${BASE_URL}/resume`;
    const response = await fetch(url, { mode: 'cors' });
    const data = await response.json();
    return data;
}

export async function downloadResume(id, template, order){
    console.log(id,template)
    const url = `${BASE_URL}/download/${id}/${template}/${order}`;
    return fetch(url)
}

export async function copyResume(id, template, order){
    console.log(id,template)
    const url = `${BASE_URL}/copy/${id}/${template}/${order}`;
    return fetch(url)
}

export async function createResume(resumeData) {
    console.log(resumeData)
    const url = `${BASE_URL}/resume`;
    const response = await fetch(url, {
        method: 'POST',
        body: JSON.stringify(resumeData),
        headers: {
            'Content-Type': 'application/json'
        }
    });
    const data = await response.json();
    return data;
}
