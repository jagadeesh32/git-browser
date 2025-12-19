import { Gitgraph, TemplateName, templateExtend } from '@gitgraph/react';
import { useTheme } from '../contexts/ThemeContext';

const GitGraph = ({ graphData, onNodeClick }) => {
  const { theme } = useTheme();

  if (!graphData || graphData.length === 0) {
    return <div className="p-4 text-gray-400">No commits to display</div>;
  }

  // Dark Mode Template
  const darkTemplate = templateExtend(TemplateName.Metro, {
    colors: ["#60a5fa", "#f472b6", "#4ade80", "#fbbf24", "#fb7185", "#22d3ee", "#a78bfa"], // Tailwind colors
    branch: {
      lineWidth: 3,
      spacing: 50,
      label: {
        display: true,
        font: "normal 11pt 'Inter', sans-serif",
        borderRadius: 8,
      },
    },
    commit: {
      spacing: 50,
      dot: {
        size: 8,
        strokeWidth: 2,
        strokeColor: "#18181b",
      },
      message: {
        display: true,
        displayAuthor: true,
        displayHash: true, // This enables SHA display
        font: "normal 12pt 'Inter', sans-serif",
        color: "#e4e4e7",
      },
    },
  });

  // Light Mode Template
  const lightTemplate = templateExtend(TemplateName.Metro, {
    colors: ["#2563eb", "#db2777", "#16a34a", "#d97706", "#dc2626", "#0891b2", "#7c3aed"], // Darker for light mode
    branch: {
      lineWidth: 3,
      spacing: 50,
      label: {
        display: true,
        font: "normal 11pt 'Inter', sans-serif",
        borderRadius: 8,
      },
    },
    commit: {
      spacing: 50,
      dot: {
        size: 8,
        strokeWidth: 2,
        strokeColor: "#ffffff",
      },
      message: {
        display: true,
        displayAuthor: true,
        displayHash: true,
        font: "normal 12pt 'Inter', sans-serif",
        color: "#1f2937",
      },
    },
  });

  return (
    <div className="h-full overflow-auto bg-white dark:bg-[#18181b] p-4 text-gray-900 dark:text-white transition-colors duration-200">
      <Gitgraph
        options={{
          template: theme === 'dark' ? darkTemplate : lightTemplate,
          orientation: "vertical-reverse",
          mode: "compact",
          author: " ", // hide default author prefix if needed
        }}
      >
        {(gitgraph) => {
          // 1. Sort by timestamp ascending (oldest first)
          const sortedData = [...graphData].sort((a, b) => a.timestamp - b.timestamp);

          // 2. Maps to track state
          const branchMap = {}; // Name -> Branch Object
          const shaToBranch = {}; // SHA -> Branch Object (where the commit was placed)
          const shaToCommit = {}; // SHA -> Commit Object (optional, for reference)

          sortedData.forEach((node) => {
            // Heuristic: The first branch listed is the "owner" of this commit.
            // If no branches listed (detached), use 'detached'.
            // If multiple, the others are just pointing to it.
            let branchName = node.branches && node.branches.length > 0 ? node.branches[0] : 'detached';

            // If we haven't seen this branch yet, we need to create it.
            // Ideally from its parent's branch.
            if (!branchMap[branchName]) {
              let sourceBranch = gitgraph; // Default to root

              if (node.parents && node.parents.length > 0) {
                const parentSha = node.parents[0];
                const parentBranch = shaToBranch[parentSha];
                if (parentBranch) {
                  sourceBranch = parentBranch;
                }
              }

              // Create the branch
              // If source is gitgraph (root), it creates a new root branch
              branchMap[branchName] = sourceBranch.branch(branchName);
            }

            const currentBranch = branchMap[branchName];
            shaToBranch[node.sha] = currentBranch;

            // Handle Merge
            // If there is a second parent, and we know about it, merge it in.
            let mergeBranch = null;
            if (node.parents.length > 1) {
              const mergeSha = node.parents[1];
              const mergeSource = shaToBranch[mergeSha];
              if (mergeSource && mergeSource.name !== branchName) {
                mergeBranch = mergeSource;
              }
            }

            const commitOptions = {
              sha: node.sha,
              subject: node.message,
              author: `${node.author} <${new Date(node.timestamp * 1000).toLocaleDateString()}>`,
              onClick: () => onNodeClick && onNodeClick(node.sha),
              style: {
                message: {
                  color: "#e4e4e7"
                },
                dot: {
                  color: node.tags && node.tags.length > 0 ? "#facc15" : undefined, // Yellow for tags
                }
              }
            };

            if (mergeBranch) {
              currentBranch.merge({
                branch: mergeBranch,
                compmmitOptions: commitOptions, // gitgraph api quirk? pass props directly
                ...commitOptions
              });
            } else {
              currentBranch.commit(commitOptions);
            }

            // Tagging
            if (node.tags && node.tags.length > 0) {
              currentBranch.tag({
                name: node.tags.join(', '),
                style: {
                  bgColor: "#facc15",
                  color: "black",
                  strokeColor: "#ca8a04",
                  borderRadius: 4,
                  pointerWidth: 6
                }
              });
            }
          });
        }}
      </Gitgraph>
    </div>
  );
};

export default GitGraph;
