import { fireEvent, render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import DreamInterpretation from "../DreamInterpretation";

test("interprets a common symbol locally without calling an API", () => {
  const request = jest.spyOn(globalThis, "fetch");
  render(<DreamInterpretation />);
  fireEvent.change(screen.getByLabelText(/Санаж байгаа зүүдээ бичнэ үү/), {
    target: { value: "Ус, далай харсан зүүд" },
  });
  fireEvent.click(screen.getByRole("button", { name: "Бэлгэдлийг тайлбарлах" }));
  expect(screen.getByText(/Ус нь зарим уламжлалд/)).toBeInTheDocument();
  expect(request).not.toHaveBeenCalled();
  request.mockRestore();
});
test("empty dream shows validation feedback", () => {
  render(<DreamInterpretation />);
  fireEvent.click(screen.getByRole("button", { name: "Бэлгэдлийг тайлбарлах" }));
  expect(screen.getByRole("alert")).toHaveTextContent("Зүүдээ бичнэ үү");
});
