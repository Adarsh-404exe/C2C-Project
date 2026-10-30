import PageHeader from "../components/PageHeader.jsx";
import EmptyState from "../components/EmptyState.jsx";

export default function KnowledgeBase() {
  return (
    <>
      <PageHeader title="Knowledge Base" description="Help articles the assistant can answer from." />
      <div className="card mt-6">
        <EmptyState title="No articles connected">
          This app isn't connected to a knowledge base yet, so there are no articles to list, search or edit.
          When your backend exposes articles, the list and the add, edit and delete actions belong here.
        </EmptyState>
      </div>
    </>
  );
}
