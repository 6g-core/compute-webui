<template>
  <div class="h-[calc(100vh-4rem-2rem)] grid grid-cols-12 gap-4">
    <!-- 左侧 -->
    <div class="col-span-12 lg:col-span-5 xl:col-span-5 grid grid-rows-[3fr_2fr] gap-4 h-full min-h-0">
      <VideoPanel />
      <LogsPanel />
    </div>

    <!-- 右侧：流程图 -->
    <div class="col-span-12 lg:col-span-7 xl:col-span-7 h-full min-h-0">
      <MbbfTopology />
    </div>
  </div>
</template>
