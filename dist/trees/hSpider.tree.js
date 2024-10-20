class HorizontalSpiderTree {
    chartHelper;
    tree_map_arr = [];
    hc_d3 = window.d3;
    content_wrapper = null;
    hcInnerContainer = null;
    current_scale = 1;
    constructor({ hcInnerContainer, chartHelper }) {
        this.hcInnerContainer = hcInnerContainer;
        this.chartHelper = chartHelper;
        this.chartHelper.handleCollapseChildren = this.handleCollapseChildren.bind(this);
        setTimeout(() => {
            this.organizeUI();
        }, 0);
    }
    organizeUI() {
        this.content_wrapper = this.chartHelper.createDynamicEl();
        this.content_wrapper.className = "hc-head-wrapper";
        this.chartHelper.set_tmp_tree_data();
        this.map_children_data_to_head();
        this.hcInnerContainer.appendChild(this.content_wrapper);
        this.drawBranchLinkFresh();
        this.hc_d3.timeout(() => {
            const first_svg_el = this.hc_d3.select('.main-svg-el').node().getBoundingClientRect();
            this.chartHelper?.center_elem(first_svg_el, "left");
        }, 0);
    }
    map_children_data_to_head(parentSVGEl, parentId) {
        const hierarchies = this.chartHelper.tmp_tree_data.filter(data => data.parentId == parentId);
        const childElContainer = this.chartHelper.createDynamicEl();
        hierarchies.forEach(head => {
            const head_UI_wrapper = this.chartHelper.createDynamicEl();
            const head_UI_inner = this.chartHelper.createDynamicEl();
            const head_UI = this.chartHelper.makeHead(head, false, { parent: "right", children: "left" });
            head_UI_inner.append(head_UI?.node());
            head_UI_wrapper.appendChild(head_UI_inner);
            const root_el_cls = parentId == undefined ? " st-root-el" : "";
            head_UI_wrapper.className = "hc-head-node-wrapper st-single-h hc-w-id-" + head.id + root_el_cls;
            childElContainer.appendChild(head_UI_wrapper);
            parentSVGEl != undefined && this.tree_map_arr.push({ id: head.id, svgNode: parentSVGEl, targetChild: head_UI?.node(), parentId: parentId });
            if (this.chartHelper?.el_has_children(head.id)) {
                head_UI_wrapper.append(this.map_children_data_to_head(head_UI, head.id));
            }
        });
        childElContainer.className = "hc-head-wrapper st-single-h-child-container";
        if (parentSVGEl === undefined)
            this.content_wrapper?.appendChild(childElContainer);
        return childElContainer;
    }
    drawBranchLinkFresh() {
        document.querySelectorAll('.linker-line').forEach(el => el.remove());
        this.tree_map_arr.forEach(branch => this.drawBranchLink(branch.id, branch.svgNode, branch.targetChild, branch.parentId));
    }
    drawBranchLink(id, svgNode, targetChild, parentId) {
        const isParentChildrenHidden = this.hcInnerContainer?.querySelector('.hc-w-id-' + parentId)?.getAttribute('data-hc-head-children-hidden');
        if (isParentChildrenHidden === 'true')
            return;
        const color_set = this.chartHelper?.color_handler.getColor(id);
        const elementBounds = targetChild.getBoundingClientRect();
        const svgSourceNodeBounds = svgNode.node().getBoundingClientRect();
        const lineStartX = (svgSourceNodeBounds.width / this.current_scale);
        const lineStartY = (svgSourceNodeBounds.height / this.current_scale) / 2;
        const lineEndX = ((elementBounds.x) / this.current_scale) - ((svgSourceNodeBounds.x) / this.current_scale) + 0;
        const lineEndY = (((elementBounds.top + (elementBounds.height / 2)) / this.current_scale) - ((svgSourceNodeBounds.top) / this.current_scale));
        const curveFactory = this.chartHelper?.tree_link_type != undefined ? this.chartHelper?.tree_link_types[this.chartHelper?.tree_link_type] : this.hc_d3.curveBumpX;
        const link = this.hc_d3.link(curveFactory);
        const data = [
            { source: [lineStartX, lineStartY], target: [lineEndX, lineEndY] },
        ];
        svgNode?.append('path')
            .data(data)
            .attr('d', link)
            .attr('fill', 'none')
            .attr('class', 'linker-line')
            .attr('stroke-width', 1)
            .attr('stroke', color_set?.gray)
            .attr('style', 'z-index: -1');
    }
    handleCollapseChildren(svgNode, id, clicked_pos) {
        const nodeAncestor = svgNode.node()?.parentElement.parentElement;
        const nodeChildrenHidden = nodeAncestor?.getAttribute('data-hc-head-children-hidden');
        const childrenContainer = nodeAncestor?.querySelector("[class*='child-container']");
        console.log("nodeAncestor", nodeAncestor, svgNode.node()?.parentElement);
        if (!nodeAncestor?.hasAttribute('data-hc-head-children-hidden') && nodeAncestor.querySelector('.child-container').innerHTML == '') {
            this.chartHelper.set_tmp_tree_data(id);
            nodeAncestor.querySelector('.child-container').remove();
            const remade_children_obj = this.map_children_data_to_head(svgNode, id);
            nodeAncestor?.appendChild(remade_children_obj);
            nodeAncestor?.setAttribute('data-hc-head-children-hidden', 'false');
            this.drawBranchLinkFresh();
        }
        else if (nodeChildrenHidden == 'true') {
            childrenContainer.style.visibility = '';
            nodeAncestor?.setAttribute('data-hc-head-children-hidden', 'false');
            this.drawBranchLinkFresh();
        }
        else {
            childrenContainer.style.visibility = 'hidden';
            // childrenContainer?.remove();
            nodeAncestor?.querySelectorAll('.linker-line').forEach((line) => line.remove());
            nodeAncestor?.setAttribute('data-hc-head-children-hidden', 'true');
            // this.removeNodeRecursiveFromTreeMap(id)
        }
    }
    removeNodeRecursiveFromTreeMap(node_id) {
        const find_node_children = this.tree_map_arr.filter(tree => tree.parentId == node_id);
        find_node_children.forEach(child => {
            this.tree_map_arr.splice(this.tree_map_arr.findIndex(tree => tree.id == child.id), 1);
            this.tree_map_arr.filter(tree => tree.id == child.id).length > 0 && this.removeNodeRecursiveFromTreeMap(child.id);
        });
    }
}
export default HorizontalSpiderTree;
