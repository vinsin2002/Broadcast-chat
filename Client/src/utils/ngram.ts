export class Ngram {
    private ngrams: { [key: string]: { suggestions: string[], frequency: number } } = {};
    private unigramFrequency: { [key: string]: number } = {};

    // Build ngram model from a list of sentences
    buildModel(sentences: string[]) {
        sentences.forEach(sentence => {
            const words = sentence.split(' ');

            // Count unigrams
            words.forEach(word => {
                const lowerWord = word.toLowerCase();
                if (!this.unigramFrequency[lowerWord]) {
                    this.unigramFrequency[lowerWord] = 0;
                }
                this.unigramFrequency[lowerWord]++;
            });

            // Build n-grams
            for (let i = 0; i < words.length - 1; i++) {
                const key = words[i].toLowerCase();
                const value = words[i + 1].toLowerCase();
                if (!this.ngrams[key]) {
                    this.ngrams[key] = { suggestions: [], frequency: 0 };
                }

                // Update suggestions and frequency
                if (!this.ngrams[key].suggestions.includes(value)) {
                    this.ngrams[key].suggestions.push(value);
                }
                this.ngrams[key].frequency++;
            }
        });
    }

    // Get next word suggestions
    getSuggestions(lastWord: string): string[] {
        const suggestions = this.ngrams[lastWord.toLowerCase()]?.suggestions || [];
        
        // Create a frequency map for suggestions
        const suggestionFrequency: { [key: string]: number } = {};
        suggestions.forEach(suggestion => {
            suggestionFrequency[suggestion] = this.unigramFrequency[suggestion] || 0;
        });

        // Sort suggestions by frequency
        const sortedSuggestions = suggestions.sort((a, b) => suggestionFrequency[b] - suggestionFrequency[a]);

        // Return the top 5 suggestions
        return sortedSuggestions.slice(0, 5);
    }
  
    // Save model as JSON
    // Save model to JSON
    saveModelToJson(userId: string) {
        const json = JSON.stringify(this.ngrams);
        const fs = window.require('fs');
        fs.writeFileSync(`./${userId}-ngram.json`, json);
    }

    // Load model from JSON
    loadModelFromJson(userId: string) {
        const fs = window.require('fs');
        const filePath = `./${userId}-ngram.json`;

        if (fs.existsSync(filePath)) {
            const json = fs.readFileSync(filePath, 'utf-8');
            this.ngrams = JSON.parse(json);
        } else {
            // Handle the case when the file does not exist, if necessary
            console.warn(`No N-gram model found for user ID: ${userId}`);
        }
    }

  }
