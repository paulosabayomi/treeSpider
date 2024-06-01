import HCElement from "../utils/st-element.js";
class ChartMainHelper {
    hc_d3 = window.d3;
    tree_data = [];
    handleCollapseChildren = () => { };
    center_elem = ({}) => null;
    itemHierarchy = [];
    link_point_position = {
        top: (rect) => `translate(${parseInt(rect.attr('width')) / 2}, 0)`,
        bottom: (rect) => `translate(${parseInt(rect.attr('width')) / 2}, ${rect.attr('height')})`,
        right: (rect) => `translate(${rect.attr('width')}, ${rect.attr('height') / 2})`,
        left: (rect) => `translate(0, ${rect.attr('height') / 2})`,
    };
    inverse_link_point_position = {
        "top": "bottom",
        "bottom": "top",
        "left": "right",
        "right": "left",
    };
    chartHeadWidth = 120;
    chartHeadHeight = 130;
    chartHeadLandscapeWidth = 240;
    chartHeadLandscapeHeight = 80;
    chartHeadRoundedWidth = 120;
    chartHeadRoundedHeight = 180;
    color_handler = {};
    constructor() {
    }
    createDynamicEl() {
        return new HCElement();
    }
    splitStringIntoBatch(text, len) {
        let arr = [];
        for (let i = 0; i < text.length; i += len) {
            arr.push(text.substring(i, Math.min(i + len, text.length)));
        }
        return arr;
    }
    get_user_initials(name) {
        const split_name = name.split(' ');
        return split_name.length > 1 ? split_name[0][0] + split_name.at(-1)?.[0] : split_name[0][0];
    }
    format_employee_name(name, length = 15) {
        const split_name = name.split(' ');
        const make_name = split_name.length > 2 ? split_name[0] + " " + split_name.at(-1) : split_name.join(' ');
        const clip_name = this.splitStringIntoBatch(make_name, length);
        return clip_name;
    }
    makeHead(head_data, doubleVerticalPoints = false, pointPosition = { parent: "bottom", children: "top" }) {
        return this.defaultHead(head_data, doubleVerticalPoints, pointPosition);
        // return this.landscapeHead(head_data, doubleVerticalPoints, pointPosition)
        // return this.roundedHead(head_data, doubleVerticalPoints, pointPosition)
    }
    defaultHead(head_data, doubleVerticalPoints = false, pointPosition = { parent: "bottom", children: "top" }) {
        const has_children = this.tree_data.filter(data => data.parentId === head_data.id).length > 0;
        const has_parent = this.tree_data.filter(data => data.id === head_data.parentId).length > 0;
        const color_set = this.color_handler.getColor(head_data.id);
        const svgNode = this.hc_d3?.create('svg')
            .attr("class", "main-svg-el")
            .attr('width', this.chartHeadWidth)
            .attr('height', this.chartHeadHeight)
            .on('dblclick', (e) => {
            e.stopPropagation();
            const curr_target = e.currentTarget;
            const rect = curr_target.getBoundingClientRect();
            this.center_elem(rect);
        });
        // Gaussian blur
        const defs = this.hc_d3.create('defs')
            .append('filter')
            .attr('id', 'blur1')
            .attr('x', 0)
            .attr('y', 0)
            .append('feGaussianBlur')
            .attr('in', 'SourceGraphic')
            .attr('stdDeviation', '3');
        const all_group = svgNode.append('g');
        const rect = all_group?.append('rect')
            .attr('rx', 16)
            .attr('ry', 16)
            .attr('width', this.chartHeadWidth)
            .attr('height', this.chartHeadHeight)
            .attr('stroke', color_set.color)
            .attr('fill', 'none')
            .attr('stroke-width', 0);
        const firstSection = all_group?.append('g')
            .attr('y', 100);
        if (!head_data.image) {
            firstSection?.append('circle')
                .attr('r', 20)
                .attr('stroke-width', 1)
                .attr('fill', color_set.color)
                .attr('cx', parseInt(rect.attr('width')) / 2)
                .attr('cy', 35);
            firstSection?.append('text')
                .attr('class', '')
                .attr('text-anchor', 'middle')
                .attr('fill', color_set.bright500)
                .attr('x', parseInt(rect.attr('width')) / 2)
                .attr('y', 42)
                .attr('font-size', '95%')
                .text(this.get_user_initials(head_data.name)); // employee name            
        }
        else {
            firstSection.append('defs')
                .append('clipPath')
                .attr('id', "rounded-corners")
                .append('circle')
                .attr('cx', (parseInt(rect.attr('width')) / 2) - 40)
                .attr('cy', 20)
                .attr('fill', color_set.bright500)
                .attr('r', 20);
            firstSection?.append('image')
                .attr('href', head_data.image)
                .attr('preserveAspectRatio', 'xMaxYMax slice')
                .attr('width', 40)
                .attr('height', 40)
                .attr('transform', `translate(${(parseInt(rect.attr('width')) / 2) - 20}, 15)`)
                .attr('clip-path', 'url(#rounded-corners)');
        }
        const employee_name_split = this.format_employee_name(head_data.name);
        let move_down = 0;
        employee_name_split.forEach((name, i) => {
            all_group?.append('text')
                .attr('text-anchor', 'middle')
                .attr('x', parseInt(rect.attr('width')) / 2)
                .attr('y', i > 0 ? 95 : 80)
                .attr('font-size', '85%')
                .attr('fill', color_set.darker)
                .attr('style', `text-transform: ${i > 0 ? 'none' : 'capitalize'}`)
                .text(name); // employee name
            i > 0 && (move_down = 15);
        });
        const positionTitle = all_group?.append('text')
            .attr('text-anchor', 'middle')
            .attr('x', parseInt(rect.attr('width')) / 2)
            .attr('y', 100 + move_down)
            .attr('font-size', '65%');
        const titles = this.splitStringIntoBatch(head_data.role, 20); // role
        titles.forEach((title, index) => {
            positionTitle?.append('tspan')
                .attr('x', parseInt(rect.attr('width')) / 2)
                .attr('dy', index > 0 ? '.6rem' : 0)
                .text(title.toString())
                .attr('fill', color_set.dark100);
            index > 0 && (move_down += 10);
        });
        if (head_data.location !== undefined) {
            const employeeLocation = all_group?.append('text')
                .attr('text-anchor', 'middle')
                .attr('x', parseInt(rect.attr('width')) / 2)
                .attr('y', 115 + move_down)
                .attr('font-size', '65%')
                .attr('fill', color_set.dark100);
            const location_title = this.splitStringIntoBatch(head_data.location, 19); // role
            location_title.forEach((title, index) => {
                employeeLocation?.append('tspan')
                    .attr('x', parseInt(rect.attr('width')) / 2)
                    .attr('dy', index > 0 ? '.6rem' : 0)
                    .text(title.toString());
                index > 0 && (move_down += 10);
            });
        }
        const container_height = this.chartHeadHeight + move_down;
        rect?.attr('height', container_height);
        svgNode?.attr('height', container_height);
        const point_radius = 50;
        if (pointPosition != false && has_parent) {
            all_group?.append('path')
                .attr('d', this.hc_d3.symbol(this.hc_d3.symbolCircle))
                .attr('x', parseInt(rect.attr('width')) / 2)
                .attr('y', 0)
                .attr('class', 'hc-linker')
                .attr('width', point_radius)
                .attr('height', point_radius)
                .attr('fill', color_set.gray)
                .attr('transform', this.link_point_position[pointPosition.children](rect));
        }
        if (pointPosition != false && has_children) {
            const _class = this;
            const translate_y = pointPosition.parent == "bottom" ? 0 : rect.attr('height');
            all_group?.append('path')
                .attr('d', this.hc_d3.symbol(this.hc_d3.symbolCircle))
                .attr('x', parseInt(rect.attr('width')) / 2)
                .attr('y', rect.attr('height'))
                .attr('class', 'hc-linker')
                .attr('width', point_radius)
                .attr('height', point_radius)
                .attr('style', 'cursor: pointer')
                .attr('fill', color_set.gray)
                .attr('transform', this.link_point_position[this.inverse_link_point_position[pointPosition.children]](rect))
                .on('click', (e) => _class.handleCollapseChildren?.(svgNode, head_data.id, translate_y));
            if (doubleVerticalPoints) {
                const translate_y_2 = translate_y == 0 ? rect.attr('height') : 0;
                all_group?.append('path')
                    .attr('d', this.hc_d3.symbol(this.hc_d3.symbolCircle))
                    .attr('x', parseInt(rect.attr('width')) / 2)
                    .attr('y', rect.attr('height'))
                    .attr('class', 'hc-linker')
                    .attr('width', point_radius)
                    .attr('height', point_radius)
                    .attr('style', 'cursor: pointer')
                    .attr('fill', color_set.gray)
                    .attr('transform', this.link_point_position[this.inverse_link_point_position[pointPosition.parent]](rect))
                    .on('click', (e) => _class.handleCollapseChildren?.(svgNode, head_data.id, translate_y_2));
            }
        }
        return svgNode;
    }
    landscapeHead(head_data, doubleVerticalPoints = false, pointPosition = { parent: "bottom", children: "top" }) {
        const has_children = this.tree_data.filter(data => data.parentId === head_data.id).length > 0;
        const has_parent = this.tree_data.filter(data => data.id === head_data.parentId).length > 0;
        const color_set = this.color_handler.getColor(head_data.id);
        let move_down = 0;
        const svgNode = this.hc_d3?.create('svg')
            .attr("class", "main-svg-el")
            .attr('width', this.chartHeadLandscapeWidth)
            .attr('height', this.chartHeadLandscapeHeight);
        const all_group = svgNode.append('g');
        const rect = all_group?.append('rect')
            .attr('rx', 16)
            .attr('ry', 16)
            .attr('width', this.chartHeadLandscapeWidth)
            .attr('height', this.chartHeadLandscapeHeight)
            .attr('stroke', color_set.color)
            .attr('fill', 'none')
            .attr('stroke-width', 0);
        const employee_name_split = this.format_employee_name(head_data.name, 18);
        const rightGroup = all_group.append('g')
            .attr('x', 0)
            .attr('y', 0);
        const leftGroup = all_group.append('g');
        const leftStartOrigin = parseInt(rect.attr('height'));
        const employeeName = rightGroup?.append('text')
            .attr('x', leftStartOrigin)
            .attr('y', 30)
            .attr('font-size', '95%')
            .attr('fill', color_set.darker);
        employee_name_split.forEach((title, index) => {
            employeeName?.append('tspan')
                .attr('x', leftStartOrigin)
                .attr('y', 30)
                .attr('dy', index > 0 ? '.7rem' : 0)
                .attr('font-size', '95%')
                .attr('style', "z-index: +9")
                .text(title.toString());
            index > 0 && (move_down += 10);
        });
        const positionTitle = rightGroup?.append('text')
            .attr('x', leftStartOrigin)
            .attr('y', 50 + move_down)
            .attr('font-size', '65%');
        const titles = this.splitStringIntoBatch(head_data.role, 30); // role
        titles.forEach((title, index) => {
            positionTitle?.append('tspan')
                .attr('x', leftStartOrigin)
                .attr('dy', index > 0 ? '.6rem' : 0)
                .attr('y', 50 + move_down)
                .text(title.toString())
                .attr('fill', color_set.dark100);
            index > 0 && (move_down += 10);
        });
        if (head_data.location !== undefined) {
            const employeeLocation = rightGroup?.append('text')
                .attr('x', leftStartOrigin)
                .attr('y', 65 + move_down)
                .attr('font-size', '65%')
                .attr('fill', color_set.dark100);
            const location_title = this.splitStringIntoBatch(head_data.location, 30); // role
            location_title.forEach((title, index) => {
                employeeLocation?.append('tspan')
                    .attr('x', leftStartOrigin)
                    .attr('dy', index > 0 ? '.6rem' : 0)
                    .text(title.toString());
                index > 0 && (move_down += 10);
            });
        }
        rect.attr('height', this.chartHeadLandscapeHeight + move_down);
        svgNode.attr('height', this.chartHeadLandscapeHeight + move_down);
        if (!head_data.image) {
            leftGroup?.append('circle')
                .attr('r', 20)
                .attr('stroke-width', 1)
                .attr('fill', color_set.color)
                .attr('cx', (parseInt(rect.attr('height')) / 2))
                .attr('cy', (parseInt(rect.attr('height')) / 2));
            leftGroup?.append('text')
                .attr('class', '')
                .attr('text-anchor', 'middle')
                .attr('fill', color_set.bright500)
                .attr('x', parseInt(rect.attr('height')) / 2)
                .attr('y', (parseInt(rect.attr('height')) / 2) + 6)
                .attr('font-size', '95%')
                .text(this.get_user_initials(head_data.name)); // employee initials
        }
        else {
            leftGroup.append('defs')
                .append('clipPath')
                .attr('id', "rounded-corners")
                .append('circle')
                .attr('cx', 40)
                .attr('cy', 40)
                .attr('fill', color_set.bright500)
                .attr('r', 20);
            leftGroup?.append('image')
                .attr('href', head_data.image)
                .attr('width', 40)
                .attr('height', 40)
                .attr('x', 20)
                .attr('y', 20)
                .attr('preserveAspectRatio', 'xMaxYMax slice')
                .attr('clip-path', 'url(#rounded-corners)');
        }
        const point_radius = 50;
        if (pointPosition != false && has_parent) {
            all_group?.append('path')
                .attr('d', this.hc_d3.symbol(this.hc_d3.symbolCircle))
                .attr('x', parseInt(rect.attr('width')) / 2)
                .attr('y', 0)
                .attr('class', 'hc-linker')
                .attr('width', point_radius)
                .attr('height', point_radius)
                .attr('fill', color_set.gray)
                .attr('transform', this.link_point_position[pointPosition.children](rect));
        }
        if (pointPosition != false && has_children) {
            const _class = this;
            const translate_y = pointPosition.parent == "bottom" ? 0 : rect.attr('height');
            all_group?.append('path')
                .attr('d', this.hc_d3.symbol(this.hc_d3.symbolCircle))
                .attr('x', parseInt(rect.attr('width')) / 2)
                .attr('y', rect.attr('height'))
                .attr('class', 'hc-linker')
                .attr('width', point_radius)
                .attr('height', point_radius)
                .attr('style', 'cursor: pointer')
                .attr('fill', color_set.gray)
                .attr('transform', this.link_point_position[this.inverse_link_point_position[pointPosition.children]](rect))
                .on('click', (e) => _class.handleCollapseChildren?.(svgNode, head_data.id, translate_y));
            if (doubleVerticalPoints) {
                const translate_y_2 = translate_y == 0 ? rect.attr('height') : 0;
                all_group?.append('path')
                    .attr('d', this.hc_d3.symbol(this.hc_d3.symbolCircle))
                    .attr('x', parseInt(rect.attr('width')) / 2)
                    .attr('y', rect.attr('height'))
                    .attr('class', 'hc-linker')
                    .attr('width', point_radius)
                    .attr('height', point_radius)
                    .attr('style', 'cursor: pointer')
                    .attr('fill', color_set.gray)
                    .attr('transform', this.link_point_position[this.inverse_link_point_position[pointPosition.parent]](rect))
                    .on('click', (e) => _class.handleCollapseChildren?.(svgNode, head_data.id, translate_y_2));
            }
        }
        return svgNode;
    }
    roundedHead(head_data, doubleVerticalPoints = false, pointPosition = { parent: "bottom", children: "top" }) {
        const has_children = this.tree_data.filter(data => data.parentId === head_data.id).length > 0;
        const has_parent = this.tree_data.filter(data => data.id === head_data.parentId).length > 0;
        const color_set = this.color_handler.getColor(head_data.id);
        const svgNode = this.hc_d3?.create('svg')
            .attr('style', 'overflow: visible;')
            .attr('width', this.chartHeadRoundedWidth)
            .attr('height', this.chartHeadRoundedHeight);
        const all_group = svgNode.append('g');
        const rect = all_group?.append('rect')
            .attr('rx', 16)
            .attr('ry', 16)
            .attr('width', this.chartHeadRoundedWidth)
            .attr('height', this.chartHeadRoundedHeight)
            .attr('stroke', color_set.color)
            .attr('fill', 'none')
            .attr('stroke-width', 0);
        const firstSection = all_group?.append('g');
        if (!head_data.image) {
            firstSection?.append('circle')
                .attr('r', this.chartHeadRoundedWidth / 2)
                .attr('stroke-width', 1)
                .attr('fill', color_set.color)
                .attr('cx', this.chartHeadRoundedWidth / 2)
                .attr('cy', this.chartHeadRoundedWidth / 2);
            firstSection?.append('text')
                .attr('class', '')
                .attr('text-anchor', 'middle')
                .attr('fill', color_set.bright500)
                .attr('x', parseInt(rect.attr('width')) / 2)
                .attr('y', this.chartHeadRoundedWidth / 2 + 20)
                .attr('font-size', '45px')
                .text(this.get_user_initials(head_data.name)); // employee name            
        }
        else {
            firstSection.append('defs')
                .append('clipPath')
                .attr('id', "rounded-corners")
                .append('rect')
                .attr('x', 0)
                .attr('y', 0)
                .attr('rx', 100)
                .attr('ry', 100)
                .attr('fill', color_set.bright500)
                .attr('width', this.chartHeadRoundedWidth)
                .attr('height', this.chartHeadRoundedWidth);
            firstSection?.append('image')
                .attr('href', head_data.image)
                .attr('width', this.chartHeadRoundedWidth)
                .attr('height', this.chartHeadRoundedWidth)
                .attr('x', 0)
                .attr('preserveAspectRatio', 'xMaxYMax slice')
                .attr('y', 0)
                .attr('clip-path', 'url(#rounded-corners)');
        }
        const employee_name_split = this.format_employee_name(head_data.name, 27);
        let move_down = 0;
        employee_name_split.forEach((name, i) => {
            all_group?.append('text')
                .attr('text-anchor', 'middle')
                .attr('x', parseInt(rect.attr('width')) / 2)
                .attr('y', this.chartHeadRoundedWidth + 18)
                .attr('dy', i > 0 ? '.6rem' : 0)
                .attr('font-size', '105%')
                .attr('fill', color_set.darker)
                .attr('style', `text-transform: ${i > 0 ? 'none' : 'capitalize'}`)
                .text(name); // employee name
            i > 0 && (move_down = 15);
        });
        const positionTitle = all_group?.append('text')
            .attr('text-anchor', 'middle')
            .attr('x', parseInt(rect.attr('width')) / 2)
            .attr('y', this.chartHeadRoundedWidth + 35 + move_down)
            .attr('font-size', '65%');
        const titles = this.splitStringIntoBatch(head_data.role, 20); // role
        titles.forEach((title, index) => {
            positionTitle?.append('tspan')
                .attr('x', parseInt(rect.attr('width')) / 2)
                .attr('dy', index > 0 ? '.6rem' : 0)
                .text(title.toString())
                .attr('fill', color_set.dark100);
            index > 0 && (move_down += 10);
        });
        if (head_data.location !== undefined) {
            const employeeLocation = all_group?.append('text')
                .attr('text-anchor', 'middle')
                .attr('x', parseInt(rect.attr('width')) / 2)
                .attr('y', this.chartHeadRoundedWidth + 50 + move_down)
                .attr('font-size', '65%')
                .attr('fill', color_set.dark100);
            const location_title = this.splitStringIntoBatch(head_data.location, 19); // role
            location_title.forEach((title, index) => {
                employeeLocation?.append('tspan')
                    .attr('x', parseInt(rect.attr('width')) / 2)
                    .attr('dy', index > 0 ? '.6rem' : 0)
                    .text(title.toString());
                index > 0 && (move_down += 10);
            });
        }
        const container_height = this.chartHeadRoundedHeight + move_down;
        rect?.attr('height', container_height);
        svgNode?.attr('height', container_height);
        const point_radius = 50;
        if (pointPosition != false && has_parent) {
            all_group?.append('path')
                .attr('d', this.hc_d3.symbol(this.hc_d3.symbolCircle))
                .attr('x', parseInt(rect.attr('width')) / 2)
                .attr('y', 0)
                .attr('class', 'hc-linker')
                .attr('width', point_radius)
                .attr('height', point_radius)
                .attr('fill', color_set.color)
                .attr('stroke', color_set.gray)
                .attr('stroke-width', 1)
                .attr('transform', this.link_point_position[pointPosition.children](rect));
        }
        if (pointPosition != false && has_children) {
            const _class = this;
            const translate_y = pointPosition.parent == "bottom" ? 0 : rect.attr('height');
            all_group?.append('path')
                .attr('d', this.hc_d3.symbol(this.hc_d3.symbolCircle))
                .attr('x', parseInt(rect.attr('width')) / 2)
                .attr('y', rect.attr('height'))
                .attr('class', 'hc-linker')
                .attr('width', point_radius)
                .attr('height', point_radius)
                .attr('style', 'cursor: pointer;')
                .attr('fill', color_set.color)
                .attr('stroke', color_set.gray)
                .attr('stroke-width', 1)
                .attr('transform', this.link_point_position[this.inverse_link_point_position[pointPosition.children]](rect))
                .on('click', (e) => _class.handleCollapseChildren?.(svgNode, head_data.id, translate_y));
            if (doubleVerticalPoints) {
                const translate_y_2 = translate_y == 0 ? rect.attr('height') : 0;
                all_group?.append('path')
                    .attr('d', this.hc_d3.symbol(this.hc_d3.symbolCircle))
                    .attr('x', parseInt(rect.attr('width')) / 2)
                    .attr('y', rect.attr('height'))
                    .attr('class', 'hc-linker')
                    .attr('width', point_radius)
                    .attr('height', point_radius)
                    .attr('style', 'cursor: pointer')
                    .attr('fill', color_set.color)
                    .attr('stroke', color_set.gray)
                    .attr('stroke-width', 1)
                    .attr('transform', this.link_point_position[this.inverse_link_point_position[pointPosition.parent]](rect))
                    .on('click', (e) => _class.handleCollapseChildren?.(svgNode, head_data.id, translate_y_2));
            }
        }
        return svgNode;
    }
    get_tree_items_hierarchy(parentId, parent_index, action) {
        const hierarchies = this.tree_data.filter(data => data.parentId == parentId);
        const set_child_level = parent_index == undefined ? 1 : parent_index + 1;
        const level_children_arr = [];
        hierarchies.forEach(head => {
            level_children_arr.push(head);
            if (action != undefined && (action.item_id != undefined && action.item_id == head.id || action.level != undefined && action.level == set_child_level)) {
                action.callbackFn(head, set_child_level);
            }
            const has_childs = this.tree_data.filter(data => data.parentId == head.id).length > 0;
            if (has_childs) {
                this.get_tree_items_hierarchy(head.id, set_child_level, action);
            }
        });
        const current_level = this.itemHierarchy.findIndex(item => item.level == set_child_level);
        if (current_level == -1) {
            this.itemHierarchy.push({ level: set_child_level, items: level_children_arr });
        }
        else {
            this.itemHierarchy[current_level].items = level_children_arr;
        }
        return this.itemHierarchy;
    }
    get_second_ancestor_item(child_id) {
        const child_data = this.tree_data.find(data => data.id == child_id);
        const get_parent = this.tree_data.find(data => data.id == child_data?.parentId);
        const grand_parent_is_root = this.tree_data.find(data => data.id == get_parent?.parentId)?.parentId == undefined;
        let second_ancestor = undefined;
        if (get_parent?.parentId == undefined) {
            second_ancestor = child_data;
        }
        else if (!grand_parent_is_root) {
            second_ancestor = this.get_second_ancestor_item(get_parent?.id);
        }
        else {
            second_ancestor = get_parent;
        }
        return second_ancestor;
    }
    center_root_tree_el(hcInnerContainer, current_scale) {
        setTimeout(() => {
            const root_tree_wrapper = document.querySelector('.hc-v-spider-head-wrapper');
            const root_tree_el = document.querySelector('.st-root-el');
            const root_tree_el_rect = root_tree_el.getBoundingClientRect();
            const root_tree_wrapper_rect = root_tree_wrapper.getBoundingClientRect();
            const root_container_rect = hcInnerContainer?.parentElement?.getBoundingClientRect();
            const hcInnerContainerRect = hcInnerContainer?.getBoundingClientRect();
            // const moveX = ((root_container_rect!.width  / 2) - (hcInnerContainerRect.width / 2));
            // const moveY = ((root_container_rect!.height  / 2) - (hcInnerContainerRect.height / 2));
            const moveX = (((hcInnerContainer?.parentElement.offsetWidth - hcInnerContainer.clientWidth) / 2) - root_tree_el.clientLeft);
            const moveY = (((hcInnerContainer?.parentElement.offsetHeight - hcInnerContainer.clientHeight) / 2) - root_tree_el.clientTop);
            const transformOriginX = root_tree_el.offsetLeft + (root_tree_el_rect.width / 2);
            const transformOriginY = root_tree_el.offsetTop + (root_tree_el_rect.height / 2);
            // root_tree_wrapper.style.transformOrigin = `${transformOriginX}px, ${transformOriginY}px)`;
            // root_tree_wrapper.style.translate = `${this.trsnum}% ${this.trsnum}%`;
            // this.trsnum += 5
            hcInnerContainer.style.left = moveX + `px`;
            hcInnerContainer.style.top = moveY + `px`;
        }, 1000);
    }
    getElemRelPosInTree(el_id) {
        const find_el = this.tree_data.find(data => data.id == el_id);
        const find_all_siblings = this.tree_data.filter(data => data.parentId == find_el.parentId);
        return find_all_siblings.findIndex(data => data.id == find_el.id) + 1;
    }
    getIsParentRootEl(parent_id) {
        if (parent_id == undefined)
            return false;
        return this.tree_data.find(data => data.id == parent_id)?.parentId == undefined;
    }
    getIsElRootTreeChild(id) {
        if (id == undefined)
            return false;
        return this.tree_data.find(data => data.id == id)?.parentId == undefined;
    }
    getRootTreeEl() {
        return this.tree_data.find(data => data.parentId == undefined);
    }
    el_has_children(el_id) {
        return this.tree_data.filter(data => data.parentId == el_id).length > 0;
    }
    data_to_d3_format(parentId, include_stat) {
        const parent_el = this.tree_data.find(data => (parentId == undefined ? data.parentId : data.id) == parentId);
        parent_el.children = [];
        const children = this.tree_data.filter(data => data.parentId == parent_el.id);
        children.forEach(child => {
            include_stat && (child.stat = 1);
            if (this.el_has_children(child.id)) {
                parent_el.children.push(this.data_to_d3_format(child.id, include_stat));
            }
            else {
                parent_el.children.push(child);
            }
        });
        return parent_el;
    }
}
export default ChartMainHelper;
