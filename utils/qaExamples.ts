export interface QAExample {
  question: string;
  answer: string;
  followUp?: boolean;
}

export const qaExamples: QAExample[] = [
  {
    question: 'The post uses `flex` and `grid` for layout — when should I choose grid over flex?',
    answer: 'Use flex for 1-dimensional layouts (row or column) and grid for 2-dimensional layouts when you need fine control over rows and columns. If you only align items in a single axis, prefer flex; if you need both axes or explicit cell placement, use grid. Hybrid approaches (grid with flex children) are common.',
    followUp: true,
  },
  {
    question: 'Can you summarize the key takeaways of this article in 3 bullets?',
    answer: '1) The study shows A reduces B by 35% under conditions X–Z. 2) Use method M for reproducible results; avoid condition Y. 3) Recommendations: replicate on larger sample and monitor C for side effects.',
    followUp: false,
  },
  {
    question: 'I want a short meta description for my post about composting at home.',
    answer: 'Learn how to turn kitchen scraps into nutrient-rich compost in 7 easy steps — no backyard required. Perfect for apartment and small-space gardeners.',
    followUp: false,
  },
  {
    question: 'Is the benchmark in the article done on Windows or Linux? Results differ a lot on my machine.',
    answer: "The article's benchmark was run on Ubuntu 22.04 with CPU X and 16GB RAM (see the 'Environment' section). Differences can come from OS scheduler and driver versions — try replicating the exact environment or use the provided Dockerfile if available.",
    followUp: true,
  },
  {
    question: 'What is the minimal docker-compose snippet to run the sample app from this tutorial?',
    answer: '```yaml\nversion: \"3.8\"\nservices:\n  app:\n    image: sample/app:latest\n    ports:\n      - \"8080:8080\"\n    environment:\n      - NODE_ENV=production\n  db:\n    image: postgres:14\n    environment:\n      - POSTGRES_DB=appdb\n      - POSTGRES_PASSWORD=changeme\n```',
    followUp: false,
  },
  {
    question: 'Does this recipe make 4 servings or 6?',
    answer: 'The ingredient list is scaled for 4 servings. If you need 6, multiply quantities by 1.5 and round measurements where sensible.',
    followUp: false,
  },
  {
    question: "What's a good title tag for an article about building vintage synths?",
    answer: '“DIY Vintage Synths: Build Classic Analog Sounds from Scratch (Beginner-Friendly Guide)”',
    followUp: false,
  },
  {
    question: 'User comment reported as spam: can you auto-suggest a moderation action based on the text?',
    answer: "The message contains repeated promotional links and unrelated keywords — suggest 'flag as spam' and auto-hide comment pending manual review. If the user is new and it's a first offense, warn and require captcha on next comment.",
    followUp: true,
  },
  {
    question: "Explain the code sample's time complexity in one sentence.",
    answer: 'The sample runs in O(n log n) time because it sorts the input (O(n log n)) and then makes a single linear pass (O(n)).',
    followUp: false,
  },
  {
    question: 'Can you propose 3 tweet-sized hooks to promote this blog post about remote work?',
    answer: '1) "Tired of long commutes? Try these 5 science-backed habits that make remote work actually productive. 🚀"  \n2) "Remote work fatigue? Here\'s a 15-minute daily routine that improved our team\'s focus in 2 weeks. #remotework"  \n3) "Stop guessing how to set up a home office—use this checklist to boost comfort and output today."',
    followUp: false,
  },
  {
    question: 'The code example crashes with `null` on Android 9 — what quick defensive checks should I add?',
    answer: 'Add `if (obj == null) return;` before dereferences, validate inputs from Intents/Extras, and wrap risky calls in try/catch with logging. Consider using Kotlin nullable types (`?`) and `?.let { }` to handle null safely.',
    followUp: true,
  },
  {
    question: 'Do you have short reading suggestions to learn more about this topic?',
    answer: 'Yes — start with the article "Intro to X" (beginner), then the practical guide "Hands-on X" (intermediate), and finally the review paper "State of X" (advanced). I can fetch links or assemble a reading list tailored to your level.',
    followUp: true,
  },
  {
    question: 'How can I post?',
    answer: '- Go to /blog/new\n- Enter a Title and Content (no coding needed)\n- Optional: add Categories like “news, tips”\n- Click “Create Post” — you\'ll be taken to your new post',
    followUp: false,
  },
  {
    question: 'How can I delete the post?',
    answer: '- Go to /blog\n- Open the post you want to remove\n- Click the “Delete” button and confirm\n- You\'ll return to the blog list',
    followUp: false,
  },
];
