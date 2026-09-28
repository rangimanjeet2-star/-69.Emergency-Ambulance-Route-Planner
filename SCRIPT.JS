// ==========================================
// EMERGENCY AMBULANCE ROUTE PLANNER
// DIJKSTRA SHORTEST PATH ALGORITHM
// ==========================================

const graph = {
    A: {
        B: 4,
        D: 6
    },

    B: {
        A: 4,
        C: 3,
        E: 5
    },

    C: {
        B: 3,
        F: 7,
        G: 4
    },

    D: {
        A: 6,
        E: 2,
        H: 8
    },

    E: {
        B: 5,
        D: 2,
        F: 3,
        G: 5,
        H: 4
    },

    F: {
        C: 7,
        E: 3,
        G: 2
    },

    G: {
        C: 4,
        E: 5,
        F: 2,
        H: 6
    },

    H: {
        D: 8,
        E: 4,
        G: 6
    }
};


// ==========================================
// ROAD ID FUNCTION
// ==========================================

function getRoadId(a, b) {

    const roads = [
        [a, b],
        [b, a]
    ];

    const names = [
        "A-B",
        "A-D",
        "B-C",
        "B-E",
        "C-F",
        "C-G",
        "D-E",
        "D-H",
        "E-F",
        "E-G",
        "F-G",
        "G-H",
        "E-H"
    ];

    for (let road of roads) {

        const id = road.join("-");

        if (names.includes(id)) {
            return "road-" + id;
        }
    }

    return null;
}


// ==========================================
// DIJKSTRA ALGORITHM
// ==========================================

function dijkstra(start, end) {

    const distances = {};
    const previous = {};
    const unvisited = new Set(Object.keys(graph));

    // Set initial distances
    for (let node of Object.keys(graph)) {
        distances[node] = Infinity;
        previous[node] = null;
    }

    distances[start] = 0;

    while (unvisited.size > 0) {

        let current = null;
        let smallestDistance = Infinity;

        // Find closest unvisited node
        for (let node of unvisited) {

            if (distances[node] < smallestDistance) {
                smallestDistance = distances[node];
                current = node;
            }
        }

        if (current === null) {
            break;
        }

        unvisited.delete(current);

        // Destination reached
        if (current === end) {
            break;
        }

        // Check neighbors
        for (let neighbor in graph[current]) {

            const weight = graph[current][neighbor];

            const newDistance =
                distances[current] + weight;

            if (newDistance < distances[neighbor]) {

                distances[neighbor] = newDistance;

                previous[neighbor] = current;
            }
        }
    }

    // Build shortest path
    const path = [];

    let current = end;

    while (current !== null) {

        path.unshift(current);

        current = previous[current];
    }

    return {
        path: path,
        distance: distances[end]
    };
}


// ==========================================
// CLEAR PREVIOUS ROUTE
// ==========================================

function clearRoute() {

    document
        .querySelectorAll(".roads line")
        .forEach(line => {

            line.classList.remove("active");
        });

    document
        .querySelectorAll(".node")
        .forEach(node => {

            node.classList.remove("start");
            node.classList.remove("destination");
        });

    const ambulance =
        document.getElementById("ambulance");

    ambulance.style.display = "none";
}


// ==========================================
// MOVE AMBULANCE
// ==========================================

function moveAmbulance(path) {

    const ambulance =
        document.getElementById("ambulance");

    ambulance.style.display = "block";

    let index = 0;

    function moveNext() {

        if (index >= path.length) {
            return;
        }

        const node =
            document.getElementById("node-" + path[index]);

        ambulance.style.left =
            node.offsetLeft + "px";

        ambulance.style.top =
            node.offsetTop + "px";

        index++;

        setTimeout(moveNext, 750);
    }

    moveNext();
}


// ==========================================
// SHOW ROUTE
// ==========================================

function showRoute(path) {

    for (let i = 0; i < path.length - 1; i++) {

        const a = path[i];
        const b = path[i + 1];

        const roadId = getRoadId(a, b);

        if (roadId) {

            const road =
                document.getElementById(roadId);

            if (road) {

                setTimeout(() => {

                    road.classList.add("active");

                }, i * 350);
            }
        }
    }

    // Mark nodes

    const startNode =
        document.getElementById(
            "node-" + path[0]
        );

    const endNode =
        document.getElementById(
            "node-" + path[path.length - 1]
        );

    startNode.classList.add("start");
    endNode.classList.add("destination");

    moveAmbulance(path);
}


// ==========================================
// FIND ROUTE BUTTON
// ==========================================

document
    .getElementById("findRoute")
    .addEventListener("click", function () {

        const start =
            document.getElementById("startNode").value;

        const end =
            document.getElementById("endNode").value;

        if (start === end) {

            alert(
                "Ambulance station and hospital cannot be the same."
            );

            return;
        }

        clearRoute();

        const result =
            dijkstra(start, end);

        const path =
            result.path;

        const distance =
            result.distance;

        // Update dashboard

        document.getElementById("startDisplay")
            .textContent = start;

        document.getElementById("endDisplay")
            .textContent = end;

        document.getElementById("distance")
            .textContent = distance + " km";

        // Assume average emergency speed
        // 2 minutes per km for demonstration

        const estimatedTime =
            distance * 2;

        document.getElementById("time")
            .textContent =
            estimatedTime + " min";

        // Result route

        document.getElementById("routeText")
            .textContent =
            path.join(" → ");

        document.getElementById("costText")
            .textContent =
            distance + " km";

        document.getElementById("statusText")
            .textContent =
            "🚑 Route Found";

        showRoute(path);

    });


// ==========================================
// RESET BUTTON
// ==========================================

document
    .getElementById("resetBtn")
    .addEventListener("click", function () {

        clearRoute();

        document.getElementById("distance")
            .textContent = "--";

        document.getElementById("time")
            .textContent = "--";

        document.getElementById("routeText")
            .textContent =
            "Waiting for route...";

        document.getElementById("costText")
            .textContent = "--";

        document.getElementById("statusText")
            .textContent = "Ready";

        document.getElementById("startDisplay")
            .textContent = "A";

        document.getElementById("endDisplay")
            .textContent = "F";
    });