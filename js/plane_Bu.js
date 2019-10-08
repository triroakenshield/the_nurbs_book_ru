let planeOptions = {
  svgWidth: 500,
  svgHeight: 200,
  zero_x: 10,
  zero_y: 180,
  vscale: 100,
  hscale: 400
};

draw_vert_n = function (draw, x, y, lcount, tname) {
  let st = 2, stroke1 = { width: 1 };
  if (lcount % 2 == 0) {
    for (let i = 0; i < lcount / 2; i++) {
      draw.line(x - st * (1 + 2 * i), y - 5, x - st * (1 + 2 * i), y + 5).stroke(stroke1);
      draw.line(x + st * (1 + 2 * i), y - 5, x + st * (1 + 2 * i), y + 5).stroke(stroke1);
    }
  } else {
    draw.line(x, y - 5, x, y + 5).stroke(stroke1);
    for (let i = 0; i < (lcount - 1) / 2; i++) {
      draw.line(x - st * (2 + 2 * i), y - 5, x - st * (2 + 2 * i), y + 5).stroke(stroke1);
      draw.line(x + st * (2 + 2 * i), y - 5, x + st * (2 + 2 * i), y + 5).stroke(stroke1);
    }
  }

  draw.text(tname).x(x - 5).y(y + 5);
};

make_Ulegend = function (U, Ustr) {
  var res = [], val = 0, ccount = 0, ni = 0;

  for (var i = 0; i < U.length; i++) {
    if (U[i] == val) ccount++;
    else {
      res.push({ u: val, count: ccount, nname: Ustr[ni++] })
      val = U[i];
      ccount = 1;
    }
  }
  res.push({ u: val, count: ccount, nname: Ustr[ni] })
  return res;
};

draw_axis = function (elem, po, legend) {
  var draw = SVG(elem).size(po.svgWidth, po.svgHeight), stroke1 = { width: 1 };
  var markerArrow = draw.marker(17, 7, function (add) { add.path("M1,6 L16,3.5 L1,1 L1,6").fill("none").stroke(stroke1); }).ref(0, 3.5);

  draw.line(po.zero_x, po.zero_y, po.zero_x + po.svgWidth - 30, po.zero_y).stroke(stroke1).marker("end", markerArrow);
  draw.line(po.zero_x, po.zero_y, po.zero_x, 20).stroke(stroke1).marker("end", markerArrow);

  draw.line(po.zero_x - 5, po.zero_y - po.vscale, po.zero_x + 5, po.zero_y - po.vscale).stroke(stroke1);
  draw.text("1").x(-3).y(po.zero_y - po.vscale - 8);

  for (var i = 0; i < legend.length; i++) {
    draw_vert_n(draw, po.zero_x + po.hscale * legend[i].u, po.zero_y, legend[i].count, legend[i].nname);
  }

  return draw;
};