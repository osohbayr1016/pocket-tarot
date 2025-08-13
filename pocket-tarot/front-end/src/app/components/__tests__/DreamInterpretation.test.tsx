import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import DreamInterpretation from "../DreamInterpretation";
import { http } from "msw";
import { setupServer } from "msw/node";
import "@testing-library/jest-dom";

const server = setupServer(
  http.post("*/api/dreams/interpret", async ({ request }, res, ctx) => {
    return res(
      ctx.json({ success: true, interpretation: "AI тайлал", isMock: false })
    );
  })
);

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

test("shows loading and displays interpretation", async () => {
  render(<DreamInterpretation />);
  fireEvent.change(screen.getByPlaceholderText(/жишээ/i), {
    target: { value: "нисэх" },
  });
  fireEvent.click(screen.getByText(/тайлуулах/i));
  expect(screen.getByText(/тайлж байна/i)).toBeInTheDocument();
  await waitFor(() =>
    expect(screen.getByText(/AI тайлал/)).toBeInTheDocument()
  );
});
