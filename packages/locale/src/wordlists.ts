import en from '../res/wordlists/en.json';
import de from '../res/wordlists/de.json';
import es from '../res/wordlists/es.json';
import fr from '../res/wordlists/fr.json';
import pt from '../res/wordlists/pt.json';

const loadWordListPromises = new Map<string, Promise<string[]>>();

export async function getWordList(lang: string): Promise<string[]> {
	lang = lang.toLowerCase();
	console.log('lang', lang);

	if (loadWordListPromises.has(lang)) {
		return loadWordListPromises.get(lang)!;
	}

	const promise = (async () => {
		try {
			switch (lang) {
				case 'en':
					return en;
					break;

				case 'de':
					return de;
					break;

				case 'es':
					return es;
					break;

				case 'fr':
					return fr;
					break;

				default:
					return pt;
					break;
			}

			// const { default: words } = await import(
			// 	`./../res/wordlists/${lang}.json`
			// );
			// console.log('wordswords', words);
			// return words;
		} catch (e) {
			console.log('promise err', e);
			const dashIndex = lang.lastIndexOf('-');

			console.log('promise dashIndex', dashIndex);
			if (dashIndex !== -1) {
				return getWordList(lang.substring(0, dashIndex));
			} else {
				return [];
			}
		}
	})();

	loadWordListPromises.set(lang, promise);

	console.log('promise', promise);
	return promise;
}

export const AVAILABLE_LANGUAGES = [
	{ value: 'en', label: 'English' },
	{ value: 'de', label: 'Deutsch' },
	{ value: 'es', label: 'Español' },
	{ value: 'pt', label: 'Português' },
	{ value: 'fr', label: 'Français' }
];
