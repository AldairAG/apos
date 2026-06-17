export const saveToSessionStorage = (key: string, value: unknown) => {
	try {
		if (typeof window !== 'undefined' && window.sessionStorage) {
			sessionStorage.setItem(key, JSON.stringify(value));
		}
	} catch (error) {
		console.error('Error saving to sessionStorage:', error);
	}
};

export const loadFromSessionStorage = (key: string) => {
	try {
		if (typeof window !== 'undefined' && window.sessionStorage) {
			const item = sessionStorage.getItem(key);
			return item ? JSON.parse(item) : null;
		}
		return null;
	} catch (error) {
		console.error('Error loading from sessionStorage:', error);
		return null;
	}
};

export const removeFromSessionStorage = (key: string) => {
	try {
		if (typeof window !== 'undefined' && window.sessionStorage) {
			sessionStorage.removeItem(key);
		}
	} catch (error) {
		console.error('Error removing from sessionStorage:', error);
	}
};
