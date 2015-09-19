jest.autoMockOff();

import { cucc, proba } from "../src/parrot";

describe("parrot", () => {
    it("is defined", () => {
//        expect(parrot).toBeDefined();
        let p = proba();
        expect(p).toBe("proba");
    });
    it("is a good little parrot", () => {
        expect(cucc).toBe(1);
    });
});