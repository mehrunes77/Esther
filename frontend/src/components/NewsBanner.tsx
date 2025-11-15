import React, { useState, useEffect } from 'react';
import { apiClient } from '../api/client';
import styles from './NewsBanner.module.css';

interface NewsArticle {
  id: string;
  title: string;
  link: string;
  source: string;
  pubDate: string;
}

export function NewsBanner() {
  const [articles, setArticles] = useState<NewsArticle[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchNews();
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % (articles.length || 1));
    }, 8000);
    return () => clearInterval(interval);
  }, [articles.length]);

  const fetchNews = async () => {
    try {
      setError(null);
      const { articles } = await apiClient.getNews({ limit: 10, minScore: 50 });
      if (articles && articles.length > 0) {
        setArticles(articles);
      } else {
        // Backend is responding but no articles match filters
        setError('No astronomy news available at this time');
      }
    } catch (err) {
      console.error('News fetch failed:', err);
      setError('News service unavailable');
      // Don't throw, just show the error state
    }
  };

  if (error) {
    return (
      <div className={styles.banner}>
        <span className={styles.label}>news</span>
        <span className={styles.headline}>{error}</span>
        <span className={styles.source}>nasa esa arxiv</span>
      </div>
    );
  }

  if (articles.length === 0) {
    return (
      <div className={styles.banner}>
        <span className={styles.label}>news</span>
        <span className={styles.headline}>loading astronomy news feeds...</span>
        <span className={styles.source}>nasa esa arxiv</span>
      </div>
    );
  }

  const current = articles[currentIndex];

  return (
    <div className={styles.banner}>
      <span className={styles.label}>news</span>
      <a 
        href={current.link} 
        target="_blank" 
        rel="noopener noreferrer"
        className={styles.headline}
      >
        {current.title}
      </a>
      <span className={styles.source}>{current.source}</span>
    </div>
  );
}
