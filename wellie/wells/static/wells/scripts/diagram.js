// svg widths and margins
var svgWidth  = window.innerWidth - 50,
    svgHeight = window.innerHeight - 40,
    margin = {"top": 5, "right": 5, "bottom": 50, "left": 50},
    width  = svgWidth  - margin.left - margin.right,       
    height = svgHeight - margin.top  - margin.bottom;

// SVG Viewport
var svgViewport = d3.select("body").append("svg")
.attr("width",  width  + margin.left + margin.right)
.attr("height", height + margin.top  + margin.bottom)
.style("border", "1px solid");

    // Scales
let scale_factor = 1.0;
var xAxisScale = d3.scale.linear()
    //.domain([0, width])
    .domain([-200, width * scale_factor - 200])
    .range([0, width]);
    //.range([0, width * scale_factor]);

var yAxisScale = d3.scale.linear()
    //.domain([0, height])
    //.domain([height, 0])
    .domain([height * scale_factor, 0])
    .range([height, 0]);
    //.range([height * scale_factor, 0]);

// Axis Functions
var xAxis = d3.svg.axis()
    .scale(xAxisScale)
    .orient("bottom")
    .ticks(5);

var yAxis = d3.svg.axis()
    .scale(yAxisScale)
    .orient("left")
    .ticks(5);

    // D3 SVG Line Function
var lineFunction = d3.svg.line()
    .x(function(d) { return xAxisScale(d.x); })
    .y(function(d) { return yAxisScale(d.y); })
    //.interpolate("linear");
    //.interpolate("monotone");

let line_segments = [];
// Zoom Function Event Listener
function zoomFunction() {

    var panVector = d3.event.translate;
    var panX = panVector[0];
    var panY = panVector[1];

    var scaleMultiplier = d3.event.scale;
    //var scaleMultiplier = 1;

    d3.select("#pan_x_span").text(panX);
    d3.select("#pan_y_span").text(panY);
    d3.select("#v_scale_val").text(scaleMultiplier);

    innerSpace.select(".x.axis").call(xAxis);
    innerSpace.select(".y.axis").call(yAxis);

    // Redefine the D3 SVG Path Data Generator Function
    var lineFunction = d3.svg.line()
        .x(function(d) { return xAxisScale(d.x); })
        .y(function(d) { return yAxisScale(d.y); })
        .interpolate("linear");
        //.interpolate("basis");

    // Redraw the track
    d3.select(".well_track")
        .attr("d", lineFunction(track_coords));
        
    // redraws each line individually by id
    for (var i = 0; i < line_segments.length; i++){
        let segment = line_segments[i];
        d3.select('#' + segment.id)
            .attr("d", lineFunction(segment.line_data)); 
    }
}
        

// Zoom Behavior
var zoom = d3.behavior.zoom()
    .x(xAxisScale)
    .y(yAxisScale)
    .scaleExtent([0.2, 10])
    .on("zoom", zoomFunction);

    // Inner Drawing Space
var innerSpace = svgViewport.append("g")
    .attr("class", "inner_space")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")")
    .call(zoom);

// Hidden Rectangle to Fully Capture Zoom Events
innerSpace.append("g").attr("class", "hidden rectangle")
    .append("rect")
    .attr("class", "background")
    .attr("x", function(d, i) { return xAxisScale(0); })
    .attr("height", function(d, i) { return yAxisScale(height); })
    .attr("width", function(d, i) { return xAxisScale(width); })
    .attr("y", function(d, i) { return yAxisScale(0); })
    .style("fill", "green")
    .style('fill-opacity', 0.2);

// Draw Axes
innerSpace.append("g")
    .attr("class", "x axis")
    .attr("transform", "translate(0," + height + ")")
    .call(xAxis);

innerSpace.append("g")
    .attr("class", "y axis")
    .call(yAxis);

function negative_value(delta_x){
    if (delta_x > 0){
        return -1
    } else {
        return 1
    }
}

function calculate_angles(points){
    let angles = [];
    for (var i = 0; i < points.length - 1; i++){
        let delta_y = points[i].y - points[i + 1].y;
        let delta_x = points[i].x - points[i + 1].x;
        if (delta_y == 0){
            angles.push(Math.PI / 2 * negative_value(delta_x))
        } else {
            let angle = Math.atan(delta_x / delta_y);
            angles.push(angle)
        }
    }
    return angles
}

function add_lines(line_data, class_name, id){
    var a = innerSpace.append('g')
    .append('path').attr('class', class_name + " line")
    .attr('id', id)
    .attr('d', lineFunction(line_data))
    .attr("stroke", "red")
    .append("svg:title")
        .text(id);
}

function right_angle_offset(coords, offset, angle, sign){
    // calculate offset coordinates at 90 degree angle 
    const off_ang = Math.PI / 2;
    const x = Math.sin(angle + off_ang * sign) * offset + coords.x;
    const y = Math.cos(angle + off_ang * sign) * offset + coords.y;
    return {'x': x, 'y': y}
}

function mirror_tracks(track_coords, offset){
    let mirrors = {'left': [], 'right': []};
    const off_ang = Math.PI / 2;
    let angles = calculate_angles(track_coords);
    mirrors['right'].push(right_angle_offset(track_coords[0], offset, angles[0], 1))
    mirrors['left'].push(right_angle_offset(track_coords[0], offset, angles[0], -1))
    // for all points inbetween the line ends, calculate offset points from the avg line angle
    for (var i = 1; i < track_coords.length - 1; i++){
        let avg_ang = (angles[i-1] + angles[i]) / 2;
        let offset_adjust = offset / Math.cos(avg_ang - angles[i - 1]);
        mirrors['right'].push(right_angle_offset(track_coords[i], offset_adjust, avg_ang, 1))
        mirrors['left'].push(right_angle_offset(track_coords[i], offset_adjust, avg_ang, -1))
    }
    const track_last_index = track_coords.length - 1
    mirrors['right'].push(right_angle_offset(track_coords[track_last_index], offset, angles[track_last_index - 1], 1))
    mirrors['left'].push(right_angle_offset(track_coords[track_last_index], offset, angles[track_last_index - 1], -1))
    return mirrors
}


function segemnt_point(c_start, c_end, length){
    // find the coordinate a x length from c_start between the two coordinates
    let delta_y = c_end.y - c_start.y;
    let delta_x = c_end.x - c_start.x;
    if (delta_y != 0){
        const angle = Math.atan(delta_x / delta_y);
        const x = Math.sin(angle) * length + c_start.x;
        const y = Math.cos(angle) * length + c_start.y;
        return {'x': x, 'y': y}
    } else {
        const x = c_start.x + -1 * length * negative_value(delta_x);
        const y = c_start.y;
        return {'x': x, 'y': y}
    }
}

function coord_length_slice(coords, start, end){
    // given a list of xy coordinates, give the portion of the coordinates within the length slices
    let sliced_coords = []
        total_length = 0;
    if (start == 0){
        sliced_coords.push(coords[0]);
    }
    for (var i = 0; i < coords.length - 1; i++){
        let segment_length = Math.sqrt(Math.pow(coords[i].x - coords[i + 1].x, 2) + Math.pow(coords[i].y - coords[i + 1].y, 2));
        // if the start length is in this segemnt, then calculate which part of the segemnt it's in and add to sliced_coords.
        if (total_length < start && start < total_length + segment_length){
            // find mid-point coordinate
            let coord = segemnt_point(coords[i], coords[i + 1], start - total_length);
            sliced_coords.push(coord); 
        }
        if (total_length < end && end < total_length + segment_length){
            // find mid-point coordinate
            let coord = segemnt_point(coords[i], coords[i + 1], end - total_length);
            sliced_coords.push(coord); 
        }
        // if the total_length is completely within the slice at that coordinate, then add the coordinate to sliced_coords
        total_length = total_length + segment_length;
        if (start <= total_length && total_length <= end){
            sliced_coords.push(coords[i + 1]);
        }   
    }
    return sliced_coords
}

function define_csg_segments(casing_arr, track_coords, track_id){
    const line_width = 15
    const tubing_ct = 1
    // inner width is each tubing and the space around it
    const tubing_width = tubing_ct * line_width
    const tubing_space = line_width * (2 + tubing_ct)
    const inner_radius = (tubing_width + tubing_space) / 2;
    let segments = [];
    for (var i = 0; i < casing_arr.length; i++){
        let csg = casing_arr[i]
        // one line width for csg and one for it's cement
        let csg_offset = inner_radius + i * 2 * line_width;
        let track_slice = coord_length_slice(track_coords, csg.top_depth, csg.set_depth)
        let csg_mirrors = mirror_tracks(track_slice, csg_offset);
        let id = 'track_id' + track_id + 'csg_lvl' + i
        segments.push({'class': 'casing', 'line_data': csg_mirrors.right, 'id': id + 'right'})
        segments.push({'class': 'casing', 'line_data': csg_mirrors.left, 'id': id + 'left'})
        for (var ci = 0; ci < csg.cement.length; ci++){
            let cmt = csg.cement[ci]
            let cmt_offset = csg_offset + line_width
            let cmt_track = coord_length_slice(track_coords, cmt.top_depth, cmt.bottom_depth)
            let cmt_mirrors = mirror_tracks(cmt_track, cmt_offset)
            id = 'track_id' + track_id + 'csg_lvl' + i + 'cmt_lvl' + ci
            segments.push({'class': 'cement', 'line_data': cmt_mirrors.right, 'id': id + 'right'})
            segments.push({'class': 'cement', 'line_data': cmt_mirrors.left, 'id': id + 'left'})
        }
    }
    return segments
}

    
function get_hole_segments(bore_hole_arr, casing_arr, track_coords, track_id){
    // assumes bore_hole_arr is in order from shallow to deep
    const line_width = 15
    const tubing_ct = 1
    // inner width is each tubing and the space around it
    const tubing_width = tubing_ct * line_width
    const tubing_space = line_width * (2 + tubing_ct)
    const inner_radius = (tubing_width + tubing_space) / 2;
    let segments = [];
    let previous_depth = 0;
    for (var i = 0; i < bore_hole_arr.length; i++){
        let bore_hole = bore_hole_arr[i]
        // determine how far out to plot the hole by counting the casing strings within the hole
        let csg_ct = 0;
        for (var ic = 0; ic < casing_arr.length; ic++){
            if (casing_arr[ic].set_depth >= bore_hole.depth){
                csg_ct ++
            }
        }
        let bh_offset = inner_radius + csg_ct * 2 * line_width + 0;
        let track_slice = coord_length_slice(track_coords, previous_depth, bore_hole.depth);
        previous_depth = bore_hole.depth;
        let bh_mirrors = mirror_tracks(track_slice, bh_offset);
        let id = 'track_id' + track_id + 'bh_lvl' + i;
        segments.push({'class': 'bore_hole', 'line_data': bh_mirrors.right, 'id': id + 'right'})
        segments.push({'class': 'bore_hole', 'line_data': bh_mirrors.left, 'id': id + 'left'})
    }
    return segments
}
    

function plot_segments(){
    let segments = define_csg_segments(casing_arr, track_coords, 0);
    segments.push.apply(segments, get_hole_segments(bore_hole_arr, casing_arr, track_coords, 0));
    for (var i = 0; i < segments.length; i++){
        let segment = segments[i]
        add_lines(segment.line_data, segment.class, segment.id)
    }
    return segments
}

line_segments = plot_segments();


function test_plot(){
    add_lines(track_coords, 'well_track', 'well_track')
    // let mirrors = mirror_tracks(track_coords, 50);
    // add_lines(mirrors.right, 'test', 'l1')
}
test_plot()

// HTML Divs and Spans To show scale and pans
d3.select("body").append("div").attr("id", "pan_x_div").text("Pan X Translate: ");
d3.select("body").append("div").attr("id", "pan_y_div").text("Pan Y Translate: ");
d3.select("body").append("div").attr("id", "v_scale").text("D3 Zoom Scale: ");

d3.select("#pan_x_div").append("span").attr("id", "pan_x_span");
d3.select("#pan_y_div").append("span").attr("id", "pan_y_span");
d3.select("#v_scale").append("span").attr("id", "v_scale_val");