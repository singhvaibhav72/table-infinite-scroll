import DataTable from "./components/DataTable";

export default function App() {
  return (
    <div className="app">
      <header className="app__header">
        <h1>Infinite Table</h1>
        <p>React + TanStack Table + TanStack Virtual</p>
      </header>

      <main>
        <DataTable />
      </main>
    </div>
  );
}
