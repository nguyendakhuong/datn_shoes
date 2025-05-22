// SearchInput.jsx
import React, { useState, useEffect, useCallback, useRef } from "react";
import axios from "axios";
import debounce from "lodash.debounce";
import "./SearchInput.scss";
import { useNavigate } from "react-router-dom";

const SearchInput = () => {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [loading, setLoading] = useState(false);

  const containerRef = useRef(null);
  const navigate = useNavigate();
  const fetchResults = async (text) => {
    if (!text) return setResults([]);
    setLoading(true);
    try {
      const response = await axios.get(
        `http://localhost:3001/product/search?q=${text}`
      );
      setResults(response.data);
      setShowSuggestions(true);
    } catch (error) {
      console.error("Lỗi tìm kiếm:", error);
    } finally {
      setLoading(false);
    }
  };

  const debouncedFetch = useCallback(debounce(fetchResults, 500), []);

  useEffect(() => {
    debouncedFetch(query);
  }, [query, debouncedFetch]);

  // Ẩn suggestions khi click ra ngoài
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target)
      ) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelect = (item) => {
    setQuery(item.name);
    setShowSuggestions(false);
    console.log(item);
    if (item.trademark) {
      navigate(`/productDetail/${item.trademark?.name}/${item.productCode}`);
    }else{
      navigate(`/otherTrademark/${item.name}`)
    }

  };

  return (
    <div className="search-container" ref={containerRef}>
      <input
        type="text"
        className="search-input"
        placeholder="Tìm sản phẩm hoặc thương hiệu..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onFocus={() => query && setShowSuggestions(true)}
        autoComplete="off"
      />
      <span className="search-icon">&#128269;</span>

      {showSuggestions && query && (
        <div className="suggestions">
          {loading ? (
            <div className="suggestion-item">Đang tải...</div>
          ) : results.length > 0 ? (
            results.map((item) => (
              <div
                key={item.id}
                className="suggestion-item"
                onClick={() => handleSelect(item)}
              >
                {item.name} {item.brand ? `(${item.brand})` : ""}
              </div>
            ))
          ) : (
            <div className="suggestion-item">Không có kết quả</div>
          )}
        </div>
      )}
    </div>
  );
};

export default SearchInput;
