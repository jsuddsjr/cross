import CellModel from "../CellModel";

const divPartner = document.createElement("div");

describe("CellModel", () => {
  it("should construct", () => {
    const cell = new CellModel();
    expect(cell.shape.getShape()).toBe(".");
  });

  it("should set a number", () => {
    const cell = new CellModel();
    expect(cell.numberElement).toBeFalsy();
    cell.setClueNumber(1);
    expect(cell.numberElement).toBeTruthy();
  });

  it("cannot set self as partner", () => {
    const cell = new CellModel();
    cell.setPartnerCell(cell);
    expect(cell.partnerCell).toBeFalsy();
  });

  it("should toggle a partner cell", () => {
    const cell = new CellModel();
    cell.setPartnerCell(divPartner);
    cell.toggleBlocked();
    expect(cell.isBlocked).toBe(true);
    expect(cell.partnerCell.isBlocked).toBe(true);
  });
});
