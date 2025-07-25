'use client';

import { useState } from 'react';

export default function SimpleTestPage() {
    const [result, setResult] = useState(null);
    const [loading, setLoading] = useState(false);

    const runTest = async () => {
        setLoading(true);
        try {
            const response = await fetch('/api/simple-notes-test', {
                method: 'POST',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            
            const data = await response.json();
            setResult({ status: response.status, data });
        } catch (error) {
            setResult({ error: error.message });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ padding: '20px' }}>
            <h1>Simple Notes Test</h1>
            <button onClick={runTest} disabled={loading}>
                {loading ? 'Testing...' : 'Run Simple Notes Test'}
            </button>
            
            {result && (
                <div style={{ marginTop: '20px' }}>
                    <h3>Result:</h3>
                    <pre>{JSON.stringify(result, null, 2)}</pre>
                </div>
            )}
        </div>
    );
}
