// Map generation logic mapping 60 distinct regions (mega map)
export const generateWorldMap = () => {
    const nodes = [
        // North America (1-12)
        { id: 1, name: "Vancouver", x: 12, y: 15, neighbors: [2, 4, 30] },
        { id: 2, name: "Seattle", x: 13, y: 22, neighbors: [1, 3, 5] },
        { id: 3, name: "San Francisco", x: 11, y: 32, neighbors: [2, 6, 8] },
        { id: 4, name: "Calgary", x: 17, y: 16, neighbors: [1, 5, 10] },
        { id: 5, name: "Denver", x: 18, y: 28, neighbors: [2, 4, 6, 11] },
        { id: 6, name: "Los Angeles", x: 13, y: 40, neighbors: [3, 5, 7, 8] },
        { id: 7, name: "Mexico City", x: 16, y: 50, neighbors: [6, 9, 13] },
        { id: 8, name: "Texas Base", x: 19, y: 42, neighbors: [3, 6, 9, 11] },
        { id: 9, name: "Miami", x: 25, y: 44, neighbors: [7, 8, 12, 13] },
        { id: 10, name: "Toronto", x: 23, y: 18, neighbors: [4, 11, 23] },
        { id: 11, name: "Chicago", x: 22, y: 26, neighbors: [5, 8, 10, 12] },
        { id: 12, name: "New York", x: 27, y: 26, neighbors: [9, 11, 10, 23] },

        // South America (13-22)
        { id: 13, name: "Panama City", x: 20, y: 56, neighbors: [7, 9, 14, 15] },
        { id: 14, name: "Bogota", x: 22, y: 62, neighbors: [13, 15, 16] },
        { id: 15, name: "Caracas", x: 26, y: 58, neighbors: [13, 14, 21] },
        { id: 16, name: "Lima", x: 21, y: 70, neighbors: [14, 17, 18] },
        { id: 17, name: "La Paz", x: 25, y: 73, neighbors: [16, 18, 20] },
        { id: 18, name: "Santiago", x: 22, y: 83, neighbors: [16, 17, 19] },
        { id: 19, name: "Patagonia", x: 24, y: 92, neighbors: [18, 20, 56] },
        { id: 20, name: "Buenos Aires", x: 28, y: 84, neighbors: [17, 18, 19, 21] },
        { id: 21, name: "Sao Paulo", x: 32, y: 72, neighbors: [15, 20, 22] },
        { id: 22, name: "Rio de Janeiro", x: 34, y: 68, neighbors: [21, 35] },

        // Europe (23-32)
        { id: 23, name: "London", x: 44, y: 22, neighbors: [10, 12, 24, 25] },
        { id: 24, name: "Paris", x: 46, y: 28, neighbors: [23, 26, 27, 33] },
        { id: 25, name: "Oslo", x: 50, y: 12, neighbors: [23, 28, 29] },
        { id: 26, name: "Madrid", x: 43, y: 34, neighbors: [24, 27, 33] },
        { id: 27, name: "Rome", x: 50, y: 35, neighbors: [24, 26, 31, 34] },
        { id: 28, name: "Berlin", x: 51, y: 24, neighbors: [24, 25, 29, 31] },
        { id: 29, name: "Stockholm", x: 54, y: 14, neighbors: [25, 28, 30, 42] },
        { id: 30, name: "Reykjavik", x: 38, y: 10, neighbors: [1, 25, 29] }, // Bridge to Vancouver
        { id: 31, name: "Warsaw", x: 55, y: 26, neighbors: [27, 28, 32, 43] },
        { id: 32, name: "Kyiv", x: 58, y: 28, neighbors: [31, 34, 43] },

        // Africa (33-41)
        { id: 33, name: "Casablanca", x: 42, y: 44, neighbors: [24, 26, 36, 40] },
        { id: 34, name: "Cairo", x: 56, y: 45, neighbors: [27, 32, 36, 46, 47] },
        { id: 35, name: "Dakar", x: 40, y: 55, neighbors: [22, 33, 40] }, // Bridge to Rio
        { id: 36, name: "Tripoli", x: 50, y: 46, neighbors: [33, 34, 40] },
        { id: 37, name: "Kinshasa", x: 53, y: 65, neighbors: [38, 40, 41] },
        { id: 38, name: "Nairobi", x: 59, y: 62, neighbors: [37, 39, 41, 47] },
        { id: 39, name: "Johannesburg", x: 55, y: 82, neighbors: [38, 41, 56] },
        { id: 40, name: "Lagos", x: 48, y: 58, neighbors: [33, 35, 36, 37] },
        { id: 41, name: "Luanda", x: 50, y: 72, neighbors: [37, 38, 39] },

        // Middle East & Russia (42-46)
        { id: 42, name: "Moscow", x: 62, y: 18, neighbors: [29, 43, 44] },
        { id: 43, name: "Volgograd", x: 64, y: 27, neighbors: [31, 32, 42, 45, 46] },
        { id: 44, name: "Siberia Base", x: 74, y: 15, neighbors: [42, 45, 48, 59] },
        { id: 45, name: "Novosibirsk", x: 72, y: 24, neighbors: [43, 44, 48, 49] },
        { id: 46, name: "Tehran", x: 65, y: 38, neighbors: [34, 43, 47, 50] },
        { id: 47, name: "Dubai", x: 64, y: 48, neighbors: [34, 38, 46, 50] },

        // Asia (48-54)
        { id: 48, name: "Beijing", x: 80, y: 32, neighbors: [44, 45, 49, 51, 52] },
        { id: 49, name: "Ulaanbaatar", x: 77, y: 25, neighbors: [45, 48] },
        { id: 50, name: "New Delhi", x: 73, y: 44, neighbors: [46, 47, 51, 53] },
        { id: 51, name: "Bangkok", x: 78, y: 52, neighbors: [48, 50, 53, 54] },
        { id: 52, name: "Seoul", x: 86, y: 34, neighbors: [48, 58] },
        { id: 53, name: "Mumbai", x: 70, y: 50, neighbors: [50, 51, 55] },
        { id: 54, name: "Singapore", x: 80, y: 62, neighbors: [51, 55, 57] },

        // Oceania & Outposts (55-60)
        { id: 55, name: "Jakarta", x: 83, y: 68, neighbors: [53, 54, 57] },
        { id: 56, name: "Antarctic Core", x: 50, y: 95, neighbors: [19, 39, 57] },
        { id: 57, name: "Sydney", x: 90, y: 80, neighbors: [54, 55, 56, 60] },
        { id: 58, name: "Tokyo", x: 92, y: 35, neighbors: [52, 59, 60] },
        { id: 59, name: "Kamchatka", x: 94, y: 18, neighbors: [44, 58] }, // Removed Bering Strait direct connection to simplify
        { id: 60, name: "Auckland", x: 95, y: 88, neighbors: [57, 58] }
    ]

    const traits = ['TECH-CENTRIC', 'RESOURCE-RICH', 'MILITARY POWERHOUSE']

    return nodes.map(n => ({
        ...n,
        code: n.name.substring(0, 3).toUpperCase(),
        military: Math.floor(Math.random() * 80) + 10,
        oil: Math.floor(Math.random() * 80) + 10,
        tech: Math.floor(Math.random() * 80) + 10,
        trait: traits[Math.floor(Math.random() * traits.length)],
        isOccupied: false,
        hasEvent: false
    }))
}
