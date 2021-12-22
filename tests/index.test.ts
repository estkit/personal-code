import { EstonianPersonalCode } from "../src/index";

describe("EstonianPersonalCode Class", () => {
    it("Should construct correctly", () => {
        expect(new EstonianPersonalCode("37807020362").getCode()).toBe("37807020362");
        expect(new EstonianPersonalCode(37807020362 as any).getCode()).toBe("37807020362");

        expect(new EstonianPersonalCode("x780702036").getCode()).toBe("x780702036");
        expect(new EstonianPersonalCode().getCode()).toBe("");
    });
    it("Should get and set code correctly", () => {
        expect(new EstonianPersonalCode().setCode("x780702036").getCode()).toBe("x780702036");
    });
    it("Should get the gender correctly", () => {
        expect(new EstonianPersonalCode("37807020362").getGender()).toBe("male");
        expect(new EstonianPersonalCode("1").getGender()).toBe("male");
        expect(new EstonianPersonalCode("60a21000").getGender()).toBe("female");

        expect(new EstonianPersonalCode("07807020362").getGender()).toBe(null);
        expect(new EstonianPersonalCode(Date()).getGender()).toBe(null);
        expect(new EstonianPersonalCode("a").getGender()).toBe(null);
        expect(new EstonianPersonalCode().getGender()).toBe(null);
    });
    it("Should get the year correctly", () => {
        expect(new EstonianPersonalCode("37807020362").getFullYear()).toBe(1978);
        expect(new EstonianPersonalCode("378sdgdg554545f").getFullYear()).toBe(1978);
        expect(new EstonianPersonalCode("37807020362").getYear()).toBe(78);

        expect(new EstonianPersonalCode("7a8").getFullYear()).toBe(NaN);
        expect(new EstonianPersonalCode("08").getFullYear()).toBe(NaN);
        expect(new EstonianPersonalCode("7").getFullYear()).toBe(NaN);
        expect(new EstonianPersonalCode().getFullYear()).toBe(NaN);
    });
    it("Should get the month correctly", () => {
        expect(new EstonianPersonalCode("37807020362").getMonth()).toBe(7);
        expect(new EstonianPersonalCode("3aa17gdg554545f").getMonth()).toBe(17);

        expect(new EstonianPersonalCode("7a8").getMonth()).toBe(NaN);
        expect(new EstonianPersonalCode("08adg").getMonth()).toBe(NaN);
        expect(new EstonianPersonalCode("7").getMonth()).toBe(NaN);
        expect(new EstonianPersonalCode().getMonth()).toBe(NaN);
    });
    it("Should get the day correctly", () => {
        expect(new EstonianPersonalCode("37807020362").getDay()).toBe(2);
        expect(new EstonianPersonalCode("3aa1700g554545f").getDay()).toBe(0);
        expect(new EstonianPersonalCode("3aa1756g554545f").getDay()).toBe(56);

        expect(new EstonianPersonalCode("7a8").getDay()).toBe(NaN);
        expect(new EstonianPersonalCode("78ad2g4").getDay()).toBe(NaN);
        expect(new EstonianPersonalCode(Date()).getDay()).toBe(NaN);
        expect(new EstonianPersonalCode().getDay()).toBe(NaN);
    });
    it("Should get the Date correctly", () => {
        expect(new EstonianPersonalCode("37807020362").getDate()).toStrictEqual(new Date(1978, 6, 2));
        // expect(new EstonianPersonalCode(37807020362 as any).getCode()).toBe("37807020362");
    });
    it("Should get the ID correctly", () => {
        expect(new EstonianPersonalCode("37807020362").getId()).toBe(36);
        expect(new EstonianPersonalCode("3aa170s055c545f").getId()).toBe(55);
        expect(new EstonianPersonalCode("3aa17560004545f").getId()).toBe(0);

        expect(new EstonianPersonalCode("7a8").getId()).toBe(NaN);
        expect(new EstonianPersonalCode("78ad2g4df4fk").getId()).toBe(NaN);
        expect(new EstonianPersonalCode(Date()).getId()).toBe(NaN);
        expect(new EstonianPersonalCode().getId()).toBe(NaN);
    });
    it("Should get the checksum correctly", () => {
        expect(new EstonianPersonalCode("37807020362").getChecksum()).toBe(2);
        expect(new EstonianPersonalCode("3aa1700g554545f").getChecksum()).toBe(4);
        expect(new EstonianPersonalCode("3aa1756g000545f").getChecksum()).toBe(0);

        expect(new EstonianPersonalCode("7a8").getChecksum()).toBe(NaN);
        expect(new EstonianPersonalCode("78ad2g4df4fk").getChecksum()).toBe(NaN);
        expect(new EstonianPersonalCode(Date()).getChecksum()).toBe(NaN);
        expect(new EstonianPersonalCode().getChecksum()).toBe(NaN);
    });
    it("Should calculate the checksum", () => {
        expect(new EstonianPersonalCode("37807020362").calculateChecksum()).toBe(2);
    });
    // it("Should get hospital correctly", () => {
    //     expect(new EstonianPersonalCode("37807020362").calculateChecksum()).toBe(2);
    // });
    it("Should parse/validate", () => {
        expect(new EstonianPersonalCode("3780702036").parse()).toHaveProperty("errors");
        expect(new EstonianPersonalCode("3780702036").parse()).toHaveProperty("data");
        expect(new EstonianPersonalCode("3780702036").validate()).toHaveProperty("length", { "actual": 10, "required": 11 });
    });
    it("Should encode/decode", () => {
        const decoded = new EstonianPersonalCode("37807020362").decode();
        expect(new EstonianPersonalCode().encode(decoded!).getCode()).toBe("37807020362");
    });
});