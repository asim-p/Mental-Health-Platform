# Relevance Scoring System: Technical Documentation

## Overview
The "MHP" platform uses a **Weighted Categorical Scoring (WCS)** algorithm to recommend therapists. This ensures that users always see the most relevant support even if a "perfect" match across all filters (budget, gender, language) is not available.

## The Formula
The Relevance Score ($S$) for a therapist is calculated as the sum of individual weights assigned to specific matching criteria:

$$S = W_{specialty} + W_{gender} + W_{language} + W_{budget}$$

### 1. Clinical Match ($W_{specialty}$) - Weight: 10
The most critical factor. If the therapist's specializations include the AI-detected category (e.g., "Anxiety" or "General Consultation" for cases where no specific condition is detected), they receive the maximum clinical weight.
*   **Match**: +10 pts
*   **No Match**: 0 pts

### 2. Preference Matches - Weight: 5 each
These factors align the therapist with the user's personal comfort and lifestyle.
*   **Gender Match ($W_{gender}$)**: +5 pts if the therapist's gender matches the user's preference.
*   **Language Match ($W_{language}$)**: +5 pts if there is an intersection between the user's preferred language and the therapist's spoken languages.
*   **Budget Match ($W_{budget}$)**: +5 pts if the therapist's hourly rate is less than or equal to the user's specified budget.

## Scoring Matrix Example
| Scenario | Clinical (10) | Gender (5) | Language (5) | Budget (5) | Total Score |
| :--- | :---: | :---: | :---: | :---: | :---: |
| **Perfect Match** | ✅ | ✅ | ✅ | ✅ | **25** |
| **Good Clinical Match** | ✅ | ❌ | ✅ | ✅ | **20** |
| **Clinical Only** | ✅ | ❌ | ❌ | ❌ | **10** |
| **Preference Match Only** | ❌ | ✅ | ✅ | ✅ | **15** |

## Implementation Details (Backend)
The system uses a **MongoDB Aggregation Pipeline**:
1.  **`$match`**: Filters for verified therapists only.
2.  **`$addFields`**: Uses `$cond` and `$setIntersection` to calculate the `relevanceScore` dynamically per request.
3.  **`$sort`**: Orders results by `relevanceScore` (Primary) and `rating` (Secondary).

## Benefits
- **Zero "No Results" States**: As long as there are therapists, the user sees the "next best thing."
- **Priority-First Matching**: Clinical expertise is always prioritized over secondary preferences like gender or budget.
