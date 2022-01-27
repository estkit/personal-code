// import { parse } from "../src/parse";

// describe("Personal code parser", () => {
//     it("Should return errors and data", () => {
//         expect(parse("3780702036")).toHaveProperty("errors");
//         expect(parse(3780702036 as any)).toHaveProperty("data");
//     });
//     it("Should parse correctly", () => {
//         expect(parse("37807020362")).toStrictEqual({ "data": { "checksum": 2, "day": 2, "gender": "male", "id": 36, "month": 7, "year": 1978 } });
//         expect(parse("60210020019")).toStrictEqual({ "data": { "checksum": 9, "day": 2, "gender": "female", "id": 1, "month": 10, "year": 2002 } });
//     })
// });