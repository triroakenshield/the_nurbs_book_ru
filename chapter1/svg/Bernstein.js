function Bernstein(i, n, u) {
  var temp = [];
  for (var j = 0; j <= n; j++) {
    temp.push(0.0);
  }
  temp[n - i] = 1.0;
  var u1 = 1.0 - u;
  for (var k = 1; k <= n; k++) {
    for (var j = n; j >= k; j--) {
      temp[j] = u1 * temp[j] + u * temp[j - 1];
    }
  }
  return temp[n];
}

function deCasteljau1(P, n, u) {
  /* Вычисление точку на кривой Безье */
  /* Алгоритм де Кастельжо */
  /* Вход: P,n,u  */
  /* Выход: C (точка) */
  var Q = [];
  for (var i = 0; i <= n; i++) {
    /* Используя локальный массив таким образом, мы не */
    Q.push(P[i]);
  } /* разрушаем контрольные точки */
  for (var k = 0; k < n; k++) {
    for (var i = 0; i < n - k; i++) {
      Q[i][0] = (1.0 - u) * Q[i][0] + u * Q[i + 1][0];
      Q[i][1] = (1.0 - u) * Q[i][1] + u * Q[i + 1][1];
    }
  }
  return Q[0];
}

function DrawPath(n) {
  var sp = "M", u, x, step = 30;
  for (var j = 0; j <= n; j++) {
    for (var i = 0; i <= step; i++) {
      u = i / step;
      x = Bernstein(j, n, u);
      sp = sp.concat(10 + 280 * u, " ", 240 - 200 * x, " ");
    }
  }
  return sp;
}

function DrawPath1(j, n) {
  var sp = "M", u, x, step = 30;
  for (var i = 0; i <= step; i++) {
    u = i / step;
    x = Bernstein(j, n, u);
    sp = sp.concat(10 + 280 * u, " ", 240 - 200 * x, " ");
  }
  return sp;
}

function DrawPathDer(j, n, scale) {
  var sp = "M", u, x1, x2, step = 60;
  for (var i = 0; i <= step; i++) {
    u = i / step;
    x1 = Bernstein(j - 1, n - 1, u);
    x2 = Bernstein(j, n - 1, u);
    sp = sp.concat(10 + 280 * u, " ", 240 - scale * n * (x1 - x2), " ");
  }
  return sp;
}
