import { Model } from "./Model";

describe('testing Model', () => {
    it('should to create a model and return the name', () => {
        const model = Model.create('codex', 500);
        expect(model.name).toBe('codex');
    });
    it('should to create a model and return the max tokens', () => {
        const model = Model.create('codex', 500);
        expect(model.maxTokens).toBe(500);
    });
});